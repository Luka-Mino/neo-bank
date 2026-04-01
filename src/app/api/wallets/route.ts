import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { wallets, dakotaCustomers } from "@/lib/db/schema";

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

    if (!customer || customer.kycStatus !== "active") {
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

    // Create wallet via Dakota
    // NOTE: Wallet creation requires signer groups. For a custodial model,
    // the platform manages signing keys. For now, we'll store wallet info
    // when it comes back from Dakota.
    // In sandbox, we can create a basic wallet.
    try {
      const { createWallet } = await import("@/lib/dakota/wallets");
      // TODO: Set up proper signer groups for production
      const dakotaWallet = await createWallet({
        customerId: customer.dakotaCustomerId,
        name: `${user.name || "User"}'s Wallet`,
        family: "evm",
        signerGroups: [], // Will need real signer groups in production
      });

      const [wallet] = await db
        .insert(wallets)
        .values({
          userId: user.id,
          dakotaWalletId: dakotaWallet.id,
          family: dakotaWallet.family,
          address: dakotaWallet.address,
          name: dakotaWallet.name,
        })
        .returning();

      return ok({ data: wallet }, 201);
    } catch (error) {
      console.error("Wallet creation error:", error);
      return err("Failed to create wallet. Please try again.", 500);
    }
  },
});
