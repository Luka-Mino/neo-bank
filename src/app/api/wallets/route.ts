import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { wallets, dakotaCustomers } from "@/lib/db/schema";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id));

    return ok({ data: userWallets });
  },
});

export const POST = apiHandler({
  rateLimit: { limit: 5, window: "1h" },
  handler: async ({ user }) => {
    // Check KYC status
    const [customer] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (
      !isKycBypassed() &&
      (!customer || customer.kycStatus !== "active")
    ) {
      return err("KYC verification required before creating a wallet", 403);
    }

    // Check if wallet already exists
    const existing = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return ok({ data: existing[0], message: "Wallet already exists" });
    }

    // Wallet creation is one step of post-KYC provisioning — run the whole
    // idempotent pipeline (wallet with platform signer group + policy, self
    // recipient/destination, onramp account) so a wallet is never created
    // send-disabled or without its deposit rail.
    try {
      const { provisionCustomer } = await import("@/lib/dakota/provisioning");
      await provisionCustomer(user.id);

      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, user.id))
        .limit(1);

      return ok({ data: wallet }, 201);
    } catch (error) {
      logger.error("Wallet provisioning error:", { detail: error instanceof Error ? error.message : String(error) })
      return err("Failed to set up wallet. Please try again.", 500);
    }
  },
});
