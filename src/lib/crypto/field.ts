// Reusable authenticated field encryption for PII at rest. AES-256-GCM with a
// key from the FIELD_ENCRYPTION_KEYS keyring (./keyring.ts; the implicit
// `legacy` entry is AUTH_SECRET), domain-separated per `purpose` so a blob
// encrypted for one field can't be swapped into another. Format:
//   [<keyId>$]base64(iv).base64(ciphertext).base64(gcmTag)
// (no prefix = the legacy key, as written before the keyring existed)
// The signer/API secrets stay in the secrets module; this is for stored
// personal data (phone, cached bank details) that must not sit in plaintext.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { currentKey, keyById, LEGACY_KEY_ID } from "./keyring";

function keyFor(material: string, purpose: string): Buffer {
  return createHash("sha256").update(`${material}:field:${purpose}`).digest();
}

export function encryptField(plaintext: string, purpose: string): string {
  const key = currentKey("FIELD_ENCRYPTION_KEYS");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(key.material, purpose), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const body = [
    iv.toString("base64"),
    ct.toString("base64"),
    cipher.getAuthTag().toString("base64"),
  ].join(".");
  return key.id === LEGACY_KEY_ID ? body : `${key.id}$${body}`;
}

export function decryptField(blob: string, purpose: string): string {
  const dollar = blob.indexOf("$");
  const keyId = dollar === -1 ? LEGACY_KEY_ID : blob.slice(0, dollar);
  const [ivB64, ctB64, tagB64] = blob.slice(dollar + 1).split(".");
  if (!ivB64 || !ctB64 || !tagB64) throw new Error("Malformed encrypted field");
  const material = keyById("FIELD_ENCRYPTION_KEYS", keyId).material;
  // authTagLength pins the full 16-byte tag; without it Node accepts a tag
  // truncated to 4 bytes, which makes a forged blob far easier to land.
  const decipher = createDecipheriv("aes-256-gcm", keyFor(material, purpose), Buffer.from(ivB64, "base64"), {
    authTagLength: 16,
  });
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** Safe decrypt for reads: returns the blob's plaintext, or null on any
 *  malformed/legacy value so a display path never throws. */
export function tryDecryptField(blob: string | null | undefined, purpose: string): string | null {
  if (!blob) return null;
  try {
    return decryptField(blob, purpose);
  } catch {
    return null;
  }
}
