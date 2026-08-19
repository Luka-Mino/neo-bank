// GET /api/accounts/[id]/transactions
// Account-scoped transaction feed. Returns the 50 most recent rows tagged
// with this account_id (either as the source or the destination of a
// book-transfer pair).

import { and, desc, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { transactions } from "@/lib/db/schema";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, request, db }) => {
    try {
      await assertAccountOwnership(db, params.id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    const limit = Math.min(
      Number(request.nextUrl.searchParams.get("limit") ?? "50"),
      200
    );

    const rows = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.orgId, user.orgId!),
          eq(transactions.accountId, params.id)
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return ok({ data: rows });
  },
});
