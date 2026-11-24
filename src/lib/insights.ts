// Spending insights (plan D2), computed from the transaction list the app
// already loads. Pure, so the numbers are unit-tested.
//
// What counts:
// - Completed transactions only, inside the period [start, end).
// - Money in: deposits (onramp). Money out: withdrawals (offramp) and sends.
// - Transfers between the customer's own accounts (internal_in/out) are only
//   counted when one account is in scope: across all accounts they cancel out
//   and aren't spending.
// - Funding legs (wallet_send) never count: they're the on-chain half of a
//   withdrawal or send already counted by the parent row.
import { CATEGORIES, type CategoryKey } from "@/lib/categorize";

export type InsightsPeriod = "this_month" | "last_month" | "last_3_months";

export const INSIGHTS_PERIODS: { value: InsightsPeriod; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "3 months" },
];

export type InsightsTx = {
  accountId?: string;
  txType?: string;
  status?: string;
  sourceAmount?: string;
  category?: string | null;
  createdAt?: string;
};

export type CategorySpend = { key: CategoryKey; label: string; color: string; amount: number; share: number };

export type Insights = {
  start: Date;
  end: Date;
  moneyIn: number;
  moneyOut: number;
  net: number;
  categories: CategorySpend[];
  count: number;
};

const IN_TYPES = new Set(["onramp"]);
const OUT_TYPES = new Set(["offramp", "send"]);

export function periodRange(period: InsightsPeriod, now: Date): { start: Date; end: Date } {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === "last_month") return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
  if (period === "last_3_months") return { start: new Date(y, m - 2, 1), end: new Date(y, m + 1, 1) };
  return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) };
}

function amountOf(tx: InsightsTx): number {
  const n = Number(tx.sourceAmount ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function computeInsights(
  txs: InsightsTx[],
  opts: { period: InsightsPeriod; now?: Date; accountId?: string | null }
): Insights {
  const { start, end } = periodRange(opts.period, opts.now ?? new Date());
  const scoped = Boolean(opts.accountId);
  const inTypes = scoped ? new Set([...IN_TYPES, "internal_in"]) : IN_TYPES;
  const outTypes = scoped ? new Set([...OUT_TYPES, "internal_out"]) : OUT_TYPES;

  let moneyIn = 0;
  let moneyOut = 0;
  let count = 0;
  const byCategory = new Map<CategoryKey, number>();

  for (const tx of txs) {
    if (tx.status !== "completed" || !tx.txType || !tx.createdAt) continue;
    if (scoped && tx.accountId !== opts.accountId) continue;
    const at = new Date(tx.createdAt);
    if (!(at >= start && at < end)) continue;
    const amount = amountOf(tx);
    if (inTypes.has(tx.txType)) {
      moneyIn += amount;
      count++;
    } else if (outTypes.has(tx.txType)) {
      moneyOut += amount;
      count++;
      const key = (tx.category && tx.category in CATEGORIES ? tx.category : "other") as CategoryKey;
      byCategory.set(key, (byCategory.get(key) ?? 0) + amount);
    }
  }

  const categories = [...byCategory.entries()]
    .map(([key, amount]) => ({
      key,
      label: CATEGORIES[key].label,
      color: CATEGORIES[key].color,
      amount,
      share: moneyOut > 0 ? amount / moneyOut : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { start, end, moneyIn, moneyOut, net: moneyIn - moneyOut, categories, count };
}
