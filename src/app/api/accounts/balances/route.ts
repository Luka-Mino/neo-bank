// GET /api/accounts/balances
// Returns per-account balances + the user's aggregate, all in one round
// trip. The dashboard reads this instead of /api/wallets/balances now that
// balances live at the account level.

import { and, eq, ne } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const rows = await db
      .select({
        id: accounts.id,
        accountType: accounts.accountType,
        nickname: accounts.nickname,
        currency: accounts.currency,
        balance: accounts.balance,
        status: accounts.status,
        isPrimary: accounts.isPrimary,
      })
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), ne(accounts.status, "closed")));

    const total = rows.reduce((sum, r) => sum + Number(r.balance), 0);

    return ok({
      data: {
        totalUsd: total.toFixed(2),
        accounts: rows,
      },
    });
  },
});
