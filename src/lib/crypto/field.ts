// Reusable authenticated field encryption for PII at rest. AES-256-GCM with a
// key derived from AUTH_SECRET, domain-separated per `purpose` so a blob
// encrypted for one field can't be swapped into another. Format:
//   base64(iv).base64(ciphertext).base64(gcmTag)
// The signer/API secrets stay in the secrets module; this is for stored
// personal data (phone, cached bank details) that must not sit in plaintext.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function keyFor(purpose: string): Buffer {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) throw new Error("AUTH_SECRET is not configured");
  return createHash("sha256").update(`${authSecret}:field:${purpose}`).digest();
}

export function encryptField(plaintext: string, purpose: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(purpose), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [
    iv.toString("base64"),
    ct.toString("base64"),
    cipher.getAuthTag().toString("base64"),
  ].join(".");
}

export function decryptField(blob: string, purpose: string): string {
  const [ivB64, ctB64, tagB64] = blob.split(".");
  if (!ivB64 || !ctB64 || !tagB64) throw new Error("Malformed encrypted field");
  const decipher = createDecipheriv("aes-256-gcm", keyFor(purpose), Buffer.from(ivB64, "base64"));
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
