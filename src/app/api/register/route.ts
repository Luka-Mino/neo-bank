import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, dakotaCustomers } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validators/auth";
import { createCustomer } from "@/lib/dakota/customers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
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
      // User is created but Dakota customer failed — they can retry from onboarding
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
