import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, dakotaCustomers, emailVerificationTokens } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validators/auth";
import { createCustomer } from "@/lib/dakota/customers";
import { sendVerificationEmail } from "@/lib/email";

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 5, window: "15m" },
  schema: registerSchema,
  handler: async ({ body }) => {
    const { fullName, email, password } = body;
    const normalizedEmail = email.toLowerCase();

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

    // Create Dakota customer
    try {
      const dakotaCustomer = await createCustomer({
        name: fullName,
        customerType: "individual",
        externalId: user.id,
      });

      await db.insert(dakotaCustomers).values({
        userId: user.id,
        dakotaCustomerId: dakotaCustomer.id,
        customerType: "individual",
        kycStatus: dakotaCustomer.kyb_status || "pending",
        applicationId: dakotaCustomer.application_id,
        applicationUrl: dakotaCustomer.application_url,
        applicationExpiresAt: dakotaCustomer.application_expires_at
          ? new Date(dakotaCustomer.application_expires_at)
          : null,
        externalId: user.id,
      });
    } catch (dakotaError) {
      console.error("Failed to create Dakota customer:", dakotaError);
    }

    return ok({ message: "Account created successfully", userId: user.id }, 201);
  },
});
