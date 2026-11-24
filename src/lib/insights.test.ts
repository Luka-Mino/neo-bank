import { describe, expect, it } from "vitest";
import { computeInsights, periodRange, type InsightsTx } from "./insights";

const NOW = new Date(2026, 10, 24, 12); // 24 Nov 2026, local time
const at = (y: number, m: number, d: number) => new Date(y, m, d, 10).toISOString();

const txs: InsightsTx[] = [
  { accountId: "a1", txType: "onramp", status: "completed", sourceAmount: "1000", createdAt: at(2026, 10, 2) },
  { accountId: "a1", txType: "offramp", status: "completed", sourceAmount: "200", category: "bills", createdAt: at(2026, 10, 5) },
  { accountId: "a1", txType: "send", status: "completed", sourceAmount: "50", category: "food", createdAt: at(2026, 10, 6) },
  { accountId: "a1", txType: "send", status: "completed", sourceAmount: "25", category: null, createdAt: at(2026, 10, 7) },
  // Funding leg of the withdrawal above: never counted.
  { accountId: "a1", txType: "wallet_send", status: "completed", sourceAmount: "200", createdAt: at(2026, 10, 5) },
  // Own-account transfer: only counts when one account is in scope.
  { accountId: "a1", txType: "internal_out", status: "completed", sourceAmount: "100", category: "transfers", createdAt: at(2026, 10, 8) },
  { accountId: "a2", txType: "internal_in", status: "completed", sourceAmount: "100", category: "transfers", createdAt: at(2026, 10, 8) },
  // Not completed, or outside the period.
  { accountId: "a1", txType: "send", status: "pending", sourceAmount: "999", createdAt: at(2026, 10, 9) },
  { accountId: "a1", txType: "send", status: "completed", sourceAmount: "70", category: "food", createdAt: at(2026, 9, 30) },
];

describe("periodRange", () => {
  it("covers calendar months, end exclusive", () => {
    expect(periodRange("this_month", NOW)).toEqual({ start: new Date(2026, 10, 1), end: new Date(2026, 11, 1) });
    expect(periodRange("last_month", NOW)).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 10, 1) });
    expect(periodRange("last_3_months", NOW)).toEqual({ start: new Date(2026, 8, 1), end: new Date(2026, 11, 1) });
  });

  it("handles January (previous year)", () => {
    expect(periodRange("last_month", new Date(2027, 0, 15))).toEqual({ start: new Date(2026, 11, 1), end: new Date(2027, 0, 1) });
  });
});

describe("computeInsights", () => {
  it("across all accounts: deposits in, withdrawals and sends out; no funding legs or own transfers", () => {
    const r = computeInsights(txs, { period: "this_month", now: NOW });
    expect(r.moneyIn).toBe(1000);
    expect(r.moneyOut).toBe(275);
    expect(r.net).toBe(725);
    expect(r.categories.map((c) => [c.key, c.amount])).toEqual([
      ["bills", 200],
      ["food", 50],
      ["other", 25],
    ]);
    expect(r.categories[0].share).toBeCloseTo(200 / 275);
  });

  it("for one account: transfers in and out of it count", () => {
    const a1 = computeInsights(txs, { period: "this_month", now: NOW, accountId: "a1" });
    expect(a1.moneyOut).toBe(375);
    expect(a1.categories.find((c) => c.key === "transfers")?.amount).toBe(100);
    const a2 = computeInsights(txs, { period: "this_month", now: NOW, accountId: "a2" });
    expect(a2.moneyIn).toBe(100);
    expect(a2.moneyOut).toBe(0);
  });

  it("respects the period", () => {
    const last = computeInsights(txs, { period: "last_month", now: NOW });
    expect(last.moneyOut).toBe(70);
    const three = computeInsights(txs, { period: "last_3_months", now: NOW });
    expect(three.moneyOut).toBe(345);
  });

  it("is empty-safe", () => {
    const r = computeInsights([], { period: "this_month", now: NOW });
    expect(r).toMatchObject({ moneyIn: 0, moneyOut: 0, net: 0, categories: [], count: 0 });
  });
});
