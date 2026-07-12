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
