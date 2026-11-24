// GET /api/cards/spending — what the org's cards can spend right now, and how
// much is on hold, from Dakota's wallet balances (`card` object).
// docs.dakota.xyz/documentation/cards/card-funding.md
//
// Not orgScoped: it calls Dakota, so the wallet lookup runs in its own short
// withOrg transaction rather than one held open across the HTTP call.
// Not yet exercised against Dakota's sandbox (plan 5.2): verify the shape there.

import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { withOrg } from "@/lib/db/with-org";
import { wallets } from "@/lib/db/schema";
import { getWalletBalances, parseCardSpending } from "@/lib/dakota/wallets";
import { logger } from "@/lib/logger";

export const GET = apiHandler({
  handler: async ({ user }) => {
    if (!user.orgId) return err("No active organization", 403);
    const orgId = user.orgId;
    const [wallet] = await withOrg(orgId, (tx) =>
      tx.select({ dakotaWalletId: wallets.dakotaWalletId }).from(wallets).where(eq(wallets.orgId, orgId)).limit(1)
    );
    if (!wallet) return ok({ status: "no_wallet" as const });

    try {
      const spending = parseCardSpending(await getWalletBalances(wallet.dakotaWalletId));
      // Absent = not enabled for cards yet, or the live read was slow: "try later".
      return ok(spending ? { status: "ok" as const, ...spending } : { status: "unavailable" as const });
    } catch (e) {
      logger.error("Card spending read failed:", { detail: e instanceof Error ? e.message : String(e) });
      return err("We couldn't load your card balance. Try again shortly.", 502);
    }
  },
});
