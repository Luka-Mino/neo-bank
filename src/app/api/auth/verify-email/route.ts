import { NextRequest } from "next/server";
import { eq, and, isNull, gt } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 10, window: "15m" },
  handler: async ({ request }) => {
    const { token } = await request.json();
    if (!token) return err("Token is required", 400);

    const now = new Date();

    const [verifyToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          isNull(emailVerificationTokens.verifiedAt),
          gt(emailVerificationTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!verifyToken) {
      return err("Invalid or expired verification link.", 400);
    }

    // Mark email as verified
    await db
      .update(users)
      .set({ emailVerifiedAt: now, updatedAt: now })
      .where(eq(users.id, verifyToken.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ verifiedAt: now })
      .where(eq(emailVerificationTokens.id, verifyToken.id));

    return ok({ message: "Email verified successfully" });
  },
});
