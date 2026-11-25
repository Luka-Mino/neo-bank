import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import * as OTPAuth from "otpauth";
import { currentKey, keyById, LEGACY_KEY_ID } from "@/lib/crypto/keyring";

// TOTP two-factor auth. Secrets are never stored raw: AES-256-GCM with a key
// from the FIELD_ENCRYPTION_KEYS keyring (src/lib/crypto/keyring.ts; the
// implicit `legacy` entry is AUTH_SECRET). Not an HSM, but a DB leak alone
// doesn't yield working 2FA seeds.

const ISSUER = "Moneta";

function encryptionKey(material: string): Buffer {
  return createHash("sha256").update(`${material}:totp-encryption-v1`).digest();
}

/**
 * base64(iv).base64(ciphertext).base64(gcmTag), prefixed with "<keyId>$" when
 * the current key isn't the legacy one ("$" never appears in base64).
 */
export function encryptSecret(base32Secret: string): string {
  const key = currentKey("FIELD_ENCRYPTION_KEYS");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(key.material), iv);
  const ciphertext = Buffer.concat([
    cipher.update(base32Secret, "utf8"),
    cipher.final(),
  ]);
  const body = [
    iv.toString("base64"),
    ciphertext.toString("base64"),
    cipher.getAuthTag().toString("base64"),
  ].join(".");
  return key.id === LEGACY_KEY_ID ? body : `${key.id}$${body}`;
}

export function decryptSecret(blob: string): string {
  const dollar = blob.indexOf("$");
  const keyId = dollar === -1 ? LEGACY_KEY_ID : blob.slice(0, dollar);
  const [ivB64, ctB64, tagB64] = blob.slice(dollar + 1).split(".");
  if (!ivB64 || !ctB64 || !tagB64) throw new Error("Malformed TOTP secret blob");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(keyById("FIELD_ENCRYPTION_KEYS", keyId).material),
    Buffer.from(ivB64, "base64"),
    // Pin the full 16-byte tag: without it Node accepts a truncated tag (down
    // to 4 bytes), and a forged blob only has to match those few bytes.
    { authTagLength: 16 }
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateTotpSecret(accountLabel: string): {
  base32Secret: string;
  otpauthUrl: string;
} {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountLabel,
    secret,
    algorithm: "SHA1", // authenticator-app default; wide compatibility
    digits: 6,
    period: 30,
  });
  return { base32Secret: secret.base32, otpauthUrl: totp.toString() };
}

/** window ±1 period tolerates clock skew between phone and server. */
export function verifyTotpCode(base32Secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code.trim())) return false;
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    secret: OTPAuth.Secret.fromBase32(base32Secret),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
  return totp.validate({ token: code.trim(), window: 1 }) !== null;
}

/** Current code for a secret — used by tests and the local drill only. */
export function currentTotpCode(base32Secret: string): string {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    secret: OTPAuth.Secret.fromBase32(base32Secret),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  }).generate();
}
