import { z } from "zod";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";

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

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return ok({ message: "If an account exists, a reset link has been sent." });
  },
});
