import { createHmac, randomInt } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { twoFactorBackupCodes } from "@/lib/db/schema";

// One-time 2FA recovery codes. A user who enables TOTP gets a set of these so
// losing their authenticator device is recoverable, not a permanent lockout.
//
// Codes are high-entropy (10 chars from a 30-symbol alphabet ≈ 49 bits), so a
// fast *keyed* hash (HMAC-SHA256 peppered with AUTH_SECRET) is the right tool —
// unlike low-entropy email OTPs, which need bcrypt. The pepper means a DB leak
// alone can't confirm a guessed code. Each code is single-use (used_at).

const CODE_COUNT = 10;
const CODE_LEN = 10; // characters, rendered as XXXXX-XXXXX
// Crockford-style alphabet minus ambiguous glyphs (no 0/O/1/I/L/U).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Strip formatting and uppercase: "abcde-fghij" → "ABCDEFGHIJ". */
export function normalizeBackupCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

/** Cheap pre-check so normal 6-digit TOTP logins never hit the codes table. */
export function looksLikeBackupCode(code: string): boolean {
  const n = normalizeBackupCode(code);
  return n.length === CODE_LEN && [...n].every((c) => ALPHABET.includes(c));
}

function hashBackupCode(normalized: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", `${secret}:backup-codes-v1`)
    .update(normalized)
    .digest("hex");
}

function randomCode(): string {
  let s = "";
  for (let i = 0; i < CODE_LEN; i++) s += ALPHABET[randomInt(0, ALPHABET.length)];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

/**
 * Generate a fresh set of codes, replacing any the user already had (so a
 * regenerate always invalidates the old set). Returns the plaintext codes
 * ONCE — only the hashes are persisted; they can never be shown again.
 */
export async function generateBackupCodes(userId: string): Promise<string[]> {
  await db
    .delete(twoFactorBackupCodes)
    .where(eq(twoFactorBackupCodes.userId, userId));

  const plaintext: string[] = [];
  const seen = new Set<string>();
  const rows: { userId: string; codeHash: string }[] = [];
  while (plaintext.length < CODE_COUNT) {
    const formatted = randomCode();
    const normalized = normalizeBackupCode(formatted);
    if (seen.has(normalized)) continue; // avoid a duplicate in the same set
    seen.add(normalized);
    plaintext.push(formatted);
    rows.push({ userId, codeHash: hashBackupCode(normalized) });
  }
  await db.insert(twoFactorBackupCodes).values(rows);
  return plaintext;
}

/**
 * Consume a backup code at login. Atomic single-use: the UPDATE only matches an
 * unused row, so a code can't be replayed or race two logins. Returns true iff
 * a valid, unused code was spent.
 */
export async function consumeBackupCode(
  userId: string,
  code: string
): Promise<boolean> {
  if (!looksLikeBackupCode(code)) return false;
  const codeHash = hashBackupCode(normalizeBackupCode(code));
  const consumed = await db
    .update(twoFactorBackupCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(twoFactorBackupCodes.userId, userId),
        eq(twoFactorBackupCodes.codeHash, codeHash),
        isNull(twoFactorBackupCodes.usedAt)
      )
    )
    .returning({ id: twoFactorBackupCodes.id });
  return consumed.length > 0;
}

/** Count how many unused codes the user has left (drives a low-codes nudge). */
export async function countRemainingBackupCodes(userId: string): Promise<number> {
  const rows = await db
    .select({ id: twoFactorBackupCodes.id })
    .from(twoFactorBackupCodes)
    .where(
      and(
        eq(twoFactorBackupCodes.userId, userId),
        isNull(twoFactorBackupCodes.usedAt)
      )
    );
  return rows.length;
}
