import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { wallets, walletBalances } from "@/lib/db/schema";
import { getWalletBalances as fetchDakotaBalances } from "@/lib/dakota/wallets";

export const GET = apiHandler({
  handler: async ({ user }) => {
    // Get user's wallets
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id));

    if (userWallets.length === 0) {
      return ok({ wallets: [], totalUsd: "0" });
    }

    // Fetch balances from Dakota and update cache
    const allBalances: Array<{
      walletId: string;
      dakotaWalletId: string;
      family: string;
      name: string;
      address: string;
      balances: Array<{ networkId: string; asset: string; balance: string }>;
    }> = [];

    for (const wallet of userWallets) {
      try {
        const dakotaBalances = await fetchDakotaBalances(wallet.dakotaWalletId);
        const balances = dakotaBalances.data || [];

        // Update cache
        for (const b of balances) {
          await db
            .insert(walletBalances)
            .values({
              walletId: wallet.id,
              networkId: b.network_id,
              asset: b.asset,
              balance: b.balance,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [
                walletBalances.walletId,
                walletBalances.networkId,
                walletBalances.asset,
              ],
              set: { balance: b.balance, updatedAt: new Date() },
            });
        }

        allBalances.push({
          walletId: wallet.id,
          dakotaWalletId: wallet.dakotaWalletId,
          family: wallet.family,
          name: wallet.name,
          address: wallet.address,
          balances: balances.map((b) => ({
            networkId: b.network_id,
            asset: b.asset,
            balance: b.balance,
          })),
        });
      } catch (error) {
        console.error(
          `Failed to fetch balances for wallet ${wallet.dakotaWalletId}:`,
          error
        );

        // Fall back to cached balances
        const cached = await db
          .select()
          .from(walletBalances)
          .where(eq(walletBalances.walletId, wallet.id));

        allBalances.push({
          walletId: wallet.id,
          dakotaWalletId: wallet.dakotaWalletId,
          family: wallet.family,
          name: wallet.name,
          address: wallet.address,
          balances: cached.map((b) => ({
            networkId: b.networkId,
            asset: b.asset,
            balance: b.balance,
          })),
        });
      }
    }

    // Calculate total USD value (stablecoins are 1:1 with USD)
    let totalUsd = 0;
    for (const w of allBalances) {
      for (const b of w.balances) {
        if (["USDC", "USDT", "USD"].includes(b.asset)) {
          totalUsd += parseFloat(b.balance) || 0;
        }
      }
    }

    return ok({
      wallets: allBalances,
      totalUsd: totalUsd.toFixed(2),
    });
  },
});
