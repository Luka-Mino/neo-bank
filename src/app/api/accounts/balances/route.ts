// GET /api/accounts/balances
// Returns per-account balances + the org's aggregate, all in one round trip.

import { and, eq, ne } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { accounts } from "@/lib/db/schema";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const rows = await db
      .select({
        id: accounts.id,
        accountType: accounts.accountType,
        nickname: accounts.nickname,
        currency: accounts.currency,
        asset: accounts.asset,
        balance: accounts.balance,
        status: accounts.status,
        isPrimary: accounts.isPrimary,
      })
      .from(accounts)
      .where(and(eq(accounts.orgId, user.orgId!), ne(accounts.status, "closed")));

    const total = rows.reduce((sum, r) => sum + Number(r.balance), 0);

    return ok({
      data: {
        totalUsd: total.toFixed(2),
        accounts: rows,
      },
    });
  },
});
