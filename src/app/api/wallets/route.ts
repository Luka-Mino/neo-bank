import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { wallets, dakotaCustomers } from "@/lib/db/schema";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const orgWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.orgId, user.orgId!));
    return ok({ data: orgWallets });
  },
});

// Not orgScoped: provisioning makes Dakota HTTP calls. Explicit org predicates.
export const POST = apiHandler({
  rateLimit: { limit: 5, window: "1h" },
  handler: async ({ user, db }) => {
    if (!user.orgId) return err("No active organization", 403);
    const orgId = user.orgId;

    const [customer] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, orgId))
      .limit(1);

    if (
      !isKycBypassed() &&
      (!customer || customer.kycStatus !== "active")
    ) {
      return err("KYC verification required before creating a wallet", 403);
    }

    const existing = await db
      .select()
      .from(wallets)
      .where(eq(wallets.orgId, orgId))
      .limit(1);

    if (existing.length > 0) {
      return ok({ data: existing[0], message: "Wallet already exists" });
    }

    // Wallet creation is one step of post-KYC provisioning — run the whole
    // idempotent pipeline (stamps org_id on the wallet + rails it creates).
    try {
      const { provisionCustomer } = await import("@/lib/dakota/provisioning");
      await provisionCustomer(user.id);

      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.orgId, orgId))
        .limit(1);

      return ok({ data: wallet }, 201);
    } catch (error) {
      logger.error("Wallet provisioning error:", { detail: error instanceof Error ? error.message : String(error) });
      return err("Failed to set up wallet. Please try again.", 500);
    }
  },
});
