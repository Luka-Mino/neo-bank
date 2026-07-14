import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailOtpCodes } from "@/lib/db/schema";
import { sendEmailOtp } from "@/lib/email";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/** Issue a 6-digit code, store its hash, email the plaintext. Returns nothing
 *  sensitive. Invalidates any prior unconsumed code for the user first. */
export async function issueEmailOtp(userId: string, email: string): Promise<void> {
  // Retire outstanding codes so only the newest is valid.
  await db
    .update(emailOtpCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(emailOtpCodes.userId, userId), isNull(emailOtpCodes.consumedAt)));

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await bcrypt.hash(code, 10);
  await db.insert(emailOtpCodes).values({
    userId,
    codeHash,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  await sendEmailOtp(email, code);
}

/** Verify a submitted code. Single-use, attempt-capped, time-bounded. */
export async function verifyEmailOtp(userId: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code.trim())) return false;

  const [row] = await db
    .select()
    .from(emailOtpCodes)
    .where(
      and(
        eq(emailOtpCodes.userId, userId),
        isNull(emailOtpCodes.consumedAt),
        gt(emailOtpCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(emailOtpCodes.createdAt))
    .limit(1);
  if (!row) return false;

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    await db
      .update(emailOtpCodes)
      .set({ consumedAt: new Date() })
      .where(eq(emailOtpCodes.id, row.id));
    return false;
  }

  const match = await bcrypt.compare(code.trim(), row.codeHash);
  if (!match) {
    await db
      .update(emailOtpCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(emailOtpCodes.id, row.id));
    return false;
  }

  await db
    .update(emailOtpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(emailOtpCodes.id, row.id));
  return true;
}
