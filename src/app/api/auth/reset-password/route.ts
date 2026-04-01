import { z } from "zod";
import { eq, and, isNull, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 5, window: "15m" },
  schema,
  handler: async ({ body }) => {
    const now = new Date();

    // Find valid, unused token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, body.token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!resetToken) {
      return err("Invalid or expired reset link. Please request a new one.", 400);
    }

    // Update password
    const passwordHash = await bcrypt.hash(body.password, 12);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: now })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return ok({ message: "Password updated successfully" });
  },
});
