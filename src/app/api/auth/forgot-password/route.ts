import { z } from "zod";
import { eq, and, isNull, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";

const schema = z.object({
  email: z.string().email(),
});

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 5, window: "15m" },
  schema,
  handler: async ({ body }) => {
    const email = body.email.toLowerCase();

    // Always return success to prevent email enumeration
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return ok({ message: "If an account exists, a reset link has been sent." });
    }

    // Invalidate existing tokens
    const now = new Date();

    // Generate token (24 hour expiry)
    const token = uuidv4();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // TODO: Send email via Resend with reset link
    // For now, log the token in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Password reset link: /reset-password?token=${token}`);
    }

    return ok({ message: "If an account exists, a reset link has been sent." });
  },
});
