import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { dakotaCustomers } from "@/lib/db/schema";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, user.orgId!))
      .limit(1);

    if (customer.length === 0) {
      if (isKycBypassed()) {
        // Synthetic active customer so dev flows aren't blocked.
        return ok({
          userId: user.id,
          dakotaCustomerId: null,
          customerType: "individual",
          kycStatus: "active",
          fullName: user.name ?? "Dev User",
          applicationId: null,
          applicationUrl: null,
          applicationExpiresAt: null,
          externalId: user.id,
        });
      }
      return err("No customer record found", 404);
    }

    if (isKycBypassed()) {
      return ok({ ...customer[0], kycStatus: "active" });
    }

    return ok(customer[0]);
  },
});

// Create the Dakota customer + KYC application for the signed-in user.
// Called at onboarding start (moved out of /api/register so a Dakota outage
// can't leave a user permanently without a customer record — this endpoint
// is safely retryable via its deterministic idempotency key).
export const POST = apiHandler({
  rateLimit: { limit: 5, window: "1h" },
  handler: async ({ user, db }) => {
    if (!user.orgId) return err("No active organization", 403);
    const [existing] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, user.orgId))
      .limit(1);

    if (existing) {
      return ok(existing);
    }

    try {
      const { createCustomer } = await import("@/lib/dakota/customers");
      const { provisioningIdempotencyKey } = await import(
        "@/lib/dakota/provisioning"
      );

      const dakotaCustomer = await createCustomer(
        {
          name: user.name || user.email,
          customerType: "individual",
          externalId: user.id,
        },
        { idempotencyKey: provisioningIdempotencyKey(user.id, "customer") }
      );

      const [row] = await db
        .insert(dakotaCustomers)
        .values({
          orgId: user.orgId,
          userId: user.id,
          dakotaCustomerId: dakotaCustomer.id,
          customerType: "individual",
          kycStatus: dakotaCustomer.kyb_status || "pending",
          applicationId: dakotaCustomer.application_id,
          applicationUrl: dakotaCustomer.application_url,
          // application_expires_at is a Unix timestamp in NANOSECONDS
          applicationExpiresAt: dakotaCustomer.application_expires_at
            ? new Date(Number(dakotaCustomer.application_expires_at) / 1e6)
            : null,
          externalId: user.id,
        })
        .onConflictDoNothing({ target: dakotaCustomers.userId })
        .returning();

      return ok(row ?? existing, 201);
    } catch (error) {
      logger.error("Dakota customer creation error:", { detail: error instanceof Error ? error.message : String(error) })
      return err("Could not start verification. Please try again.", 502);
    }
  },
});
