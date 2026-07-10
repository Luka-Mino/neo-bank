// POST /api/transfers/internal
// Atomic book-transfer between two of the caller's own accounts. No Dakota
// involvement — the user's underlying custodial wallet is untouched. Two
// transaction rows are written (debit on source, credit on destination)
// linked by metadata.internal_pair_id, both inside a single DB transaction.

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/db/schema";
import { internalTransferSchema } from "@/lib/validators/transfer";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const POST = apiHandler({
  schema: internalTransferSchema,
  rateLimit: { limit: 60, window: "1h" },
  handler: async ({ user, body }) => {
    // Ownership of BOTH legs before doing anything.
    let from, to;
    try {
      [from, to] = await Promise.all([
        assertAccountOwnership(body.fromAccountId, user.id),
        assertAccountOwnership(body.toAccountId, user.id),
      ]);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (from.status !== "active") {
      return err("Source account is not active", 409);
    }
    if (to.status !== "active") {
      return err("Destination account is not active", 409);
    }
    if (from.currency !== to.currency) {
      return err(
        "Cross-currency internal transfers aren't supported yet",
        409
      );
    }
    if (Number(from.balance) < Number(body.amount)) {
      return err("Insufficient balance", 402);
    }

    const pairId = randomUUID();

    try {
      const result = await db.transaction(async (tx) => {
        // Debit source. The WHERE balance >= amount clause is a defensive
        // optimistic lock: if a concurrent transfer drained the balance
        // since our check, the UPDATE matches zero rows and we abort.
        const debit = await tx
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} - ${body.amount}::numeric`,
            updatedAt: new Date(),
          })
          .where(
            sql`${accounts.id} = ${from.id} AND ${accounts.balance} >= ${body.amount}::numeric`
          )
          .returning({ id: accounts.id, balance: accounts.balance });
        if (debit.length === 0) {
          throw new Error("INSUFFICIENT_FUNDS_RACE");
        }

        // Credit destination.
        await tx
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} + ${body.amount}::numeric`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, to.id));

        const meta = {
          internal_pair_id: pairId,
          note: body.note ?? null,
          counterparty_account_id: null as string | null,
        };

        // Two ledger rows. Both reference one of the user's accounts; both
        // share metadata.internal_pair_id so the UI can pair them.
        const [debitRow, creditRow] = await Promise.all([
          tx
            .insert(transactions)
            .values({
              userId: user.id,
              accountId: from.id,
              dakotaTxId: `internal_${pairId}_debit`,
              txType: "internal_out",
              status: "completed",
              sourceAmount: body.amount,
              sourceAsset: from.currency,
              destinationAmount: body.amount,
              destinationAsset: to.currency,
              metadata: { ...meta, counterparty_account_id: to.id },
            })
            .returning(),
          tx
            .insert(transactions)
            .values({
              userId: user.id,
              accountId: to.id,
              dakotaTxId: `internal_${pairId}_credit`,
              txType: "internal_in",
              status: "completed",
              sourceAmount: body.amount,
              sourceAsset: from.currency,
              destinationAmount: body.amount,
              destinationAsset: to.currency,
              metadata: { ...meta, counterparty_account_id: from.id },
            })
            .returning(),
        ]);

        return {
          pairId,
          debit: debitRow[0],
          credit: creditRow[0],
        };
      });

      return ok(result, 201);
    } catch (e) {
      if (e instanceof Error && e.message === "INSUFFICIENT_FUNDS_RACE") {
        return err("Insufficient balance", 402);
      }
      throw e;
    }
  },
});
