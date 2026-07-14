import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Whether money-movement should require a verified email. Only enforced when
 * email is actually deliverable (RESEND_API_KEY set) — otherwise users can't
 * verify and we'd lock everyone out. So this activates automatically the
 * moment real email delivery is configured, and is inert before then.
 */
function verificationEnforced(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Returns null if the user may move money, or an { message, status } error to
 * return otherwise. Gates on a verified email when enforcement is active.
 */
export async function assertEmailVerified(
  userId: string
): Promise<{ message: string; status: number } | null> {
  if (!verificationEnforced()) return null;
  const [row] = await db
    .select({ emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.emailVerifiedAt) {
    return {
      message: "Verify your email before moving money. Check your inbox for the link.",
      status: 403,
    };
  }
  return null;
}
