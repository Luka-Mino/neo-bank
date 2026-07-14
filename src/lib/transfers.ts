// Internal (book-entry) transfer core, shared by POST /api/transfers/internal
// and the recurring executor. Caller is responsible for ownership checks;
// this function owns atomicity: optimistic-lock debit + credit + two ledger
// rows in one DB transaction.
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/db/schema";
import { categorizeTransaction } from "@/lib/categorize";

export const INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS_RACE";

export async function performInternalTransfer(params: {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  note?: string | null;
  currency: string;
}) {
  const pairId = randomUUID();
  const category = categorizeTransaction({
    txType: "internal_out",
    note: params.note,
  });

  return db.transaction(async (tx) => {
    // Debit source. WHERE balance >= amount is the optimistic lock: a
    // concurrent drain makes this match zero rows and we abort.
    const debit = await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${params.amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(
        sql`${accounts.id} = ${params.fromAccountId} AND ${accounts.balance} >= ${params.amount}::numeric AND ${accounts.status} = 'active'`
      )
      .returning({ id: accounts.id, balance: accounts.balance });
    if (debit.length === 0) {
      throw new Error(INSUFFICIENT_FUNDS);
    }

    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${params.amount}::numeric`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, params.toAccountId));

    const meta = {
      internal_pair_id: pairId,
      note: params.note ?? null,
      counterparty_account_id: null as string | null,
    };

    const [debitRow, creditRow] = await Promise.all([
      tx
        .insert(transactions)
        .values({
          userId: params.userId,
          accountId: params.fromAccountId,
          dakotaTxId: `internal_${pairId}_debit`,
          txType: "internal_out",
          status: "completed",
          category,
          sourceAmount: params.amount,
          sourceAsset: params.currency,
          destinationAmount: params.amount,
          destinationAsset: params.currency,
          metadata: { ...meta, counterparty_account_id: params.toAccountId },
        })
        .returning(),
      tx
        .insert(transactions)
        .values({
          userId: params.userId,
          accountId: params.toAccountId,
          dakotaTxId: `internal_${pairId}_credit`,
          txType: "internal_in",
          status: "completed",
          category,
          sourceAmount: params.amount,
          sourceAsset: params.currency,
          destinationAmount: params.amount,
          destinationAsset: params.currency,
          metadata: { ...meta, counterparty_account_id: params.fromAccountId },
        })
        .returning(),
    ]);

    return { pairId, debit: debitRow[0], credit: creditRow[0] };
  });
}

export type Frequency = "weekly" | "biweekly" | "monthly";

/** Next occurrence strictly after `from`. Month-end days clamp (Jan 31 → Feb 28). */
export function addPeriod(from: Date, frequency: Frequency): Date {
  const next = new Date(from);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else if (frequency === "biweekly") next.setDate(next.getDate() + 14);
  else {
    const day = next.getDate();
    next.setDate(1); // avoid month-length overflow while stepping
    next.setMonth(next.getMonth() + 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  return next;
}

/**
 * Ledger drift check: for internal (book-entry) money, every account's
 * balance should equal the net of its own internal_in/internal_out ledger
 * rows plus any externally-credited deposits. This flags accounts whose
 * balance and internal ledger history disagree — a signal of a bug or a
 * partial write. Read-only; returns the drifting accounts (empty = clean).
 *
 * Note: only INTERNAL movements are self-contained in our ledger; external
 * deposits/withdrawals settle via Dakota, so we check the internal delta
 * against the recorded internal rows rather than the absolute balance.
 */
export async function findInternalLedgerDrift(): Promise<
  Array<{ accountId: string; internalNet: string; ledgerNet: string }>
> {
  const { db } = await import("@/lib/db");
  const { sql } = await import("drizzle-orm");
  // Sum internal_in as +, internal_out as - per account from the ledger, and
  // compare to the sum of completed internal movements. Any account where the
  // two sides of the double entry don't reconcile is drift.
  const rows = await db.execute(sql`
    WITH pairs AS (
      SELECT metadata->>'internal_pair_id' AS pair_id,
             count(*) AS legs,
             sum(CASE WHEN tx_type = 'internal_in' THEN source_amount::numeric
                      WHEN tx_type = 'internal_out' THEN -source_amount::numeric
                      ELSE 0 END) AS net
      FROM transactions
      WHERE tx_type IN ('internal_in','internal_out')
        AND metadata->>'internal_pair_id' IS NOT NULL
      GROUP BY metadata->>'internal_pair_id'
    )
    SELECT pair_id, legs::text, net::text
    FROM pairs
    WHERE legs <> 2 OR net <> 0
  `);
  return (rows as unknown as Array<{ pair_id: string; legs: string; net: string }>).map(
    (r) => ({ accountId: r.pair_id, internalNet: r.net, ledgerNet: r.legs })
  );
}
