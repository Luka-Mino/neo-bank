import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { withOrg } from "@/lib/db/with-org";
import { wallets, walletBalances } from "@/lib/db/schema";
import { getWalletBalances as fetchDakotaBalances } from "@/lib/dakota/wallets";

// Not orgScoped: it calls Dakota once per wallet, so each DB step runs in its
// own short withOrg(orgId, …) transaction instead of one request-long one.
export const GET = apiHandler({
  handler: async ({ user }) => {
    if (!user.orgId) return err("No active organization", 403);
    const orgId = user.orgId;
    // Get the org's wallets
    const userWallets = await withOrg(orgId, (tx) =>
      tx.select().from(wallets).where(eq(wallets.orgId, orgId))
    );

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
        // OpenAPI shape: balances[] of {asset: AssetDeployment, amount_usd}
        const balances = (dakotaBalances.balances || []).map((b) => ({
          networkId: b.asset?.network_id ?? "",
          asset: b.asset?.name ?? b.asset?.id ?? "USDC",
          balance: b.amount_usd,
        }));

        // Update cache
        await withOrg(orgId, async (tx) => {
          for (const b of balances) {
            await tx
              .insert(walletBalances)
              .values({
                orgId,
                walletId: wallet.id,
                networkId: b.networkId,
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
        });

        allBalances.push({
          walletId: wallet.id,
          dakotaWalletId: wallet.dakotaWalletId,
          family: wallet.family,
          name: wallet.name,
          address: wallet.address,
          balances,
        });
      } catch (error) {
        logger.error(
          `Failed to fetch balances for wallet ${wallet.dakotaWalletId}:`, { detail: error instanceof Error ? error.message : String(error) })

        // Fall back to cached balances
        const cached = await withOrg(orgId, (tx) =>
          tx.select().from(walletBalances).where(eq(walletBalances.walletId, wallet.id))
        );

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
