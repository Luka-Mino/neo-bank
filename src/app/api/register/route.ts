import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { screenPassword } from "@/lib/auth/passwords";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validators/auth";
import { sendVerificationEmail } from "@/lib/email";

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 5, window: "15m" },
  schema: registerSchema,
  handler: async ({ body }) => {
    const { fullName, email, password } = body;
    const normalizedEmail = email.toLowerCase();

    const weak = screenPassword(password, { email: normalizedEmail, name: fullName });
    if (weak) return err(weak, 400);

    // Check if user exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return err("An account with this email already exists", 409);
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        fullName,
      })
      .returning({ id: users.id });

    // Send verification email
    const verifyToken = uuidv4();
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await sendVerificationEmail(normalizedEmail, verifyToken);

    // The Dakota customer record is created at onboarding start
    // (POST /api/customers) — retryable there, instead of fire-and-forget
    // here where a Dakota outage would strand the user without one.

    return ok({ message: "Account created successfully", userId: user.id }, 201);
  },
});
