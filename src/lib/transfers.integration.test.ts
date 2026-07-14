// Integration tests for the money core — run against a REAL Postgres, so the
// double-entry and balance-guard invariants are proven end to end, not
// mocked. Gated on INTEGRATION=1 (with DATABASE_URL pointing at a disposable
// DB) so the default unit run and credential-free CI stay green; the CI
// integration job sets both.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.INTEGRATION === "1";

describe.skipIf(!RUN)("performInternalTransfer (integration)", () => {
  let db: typeof import("@/lib/db").db;
  let schema: typeof import("@/lib/db/schema");
  let performInternalTransfer: typeof import("@/lib/transfers").performInternalTransfer;
  let INSUFFICIENT_FUNDS: string;
  const ids: { user?: string; a1?: string; a2?: string } = {};

  beforeAll(async () => {
    ({ db } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    ({ performInternalTransfer, INSUFFICIENT_FUNDS } = await import("@/lib/transfers"));

    const [u] = await db
      .insert(schema.users)
      .values({
        email: `itest-${Date.now()}@moneta.test`,
        passwordHash: "x",
        fullName: "Integration Test",
      })
      .returning();
    ids.user = u.id;
    const [a1] = await db
      .insert(schema.accounts)
      .values({
        userId: u.id,
        accountType: "checking",
        accountNumber: `it${Date.now()}1`,
        balance: "100",
        isPrimary: true,
      })
      .returning();
    const [a2] = await db
      .insert(schema.accounts)
      .values({
        userId: u.id,
        accountType: "savings",
        accountNumber: `it${Date.now()}2`,
        balance: "0",
      })
      .returning();
    ids.a1 = a1.id;
    ids.a2 = a2.id;
  });

  afterAll(async () => {
    if (ids.user) {
      const { eq } = await import("drizzle-orm");
      await db.delete(schema.users).where(eq(schema.users.id, ids.user));
    }
  });

  it("moves funds and writes a balanced double entry", async () => {
    const { eq, sql } = await import("drizzle-orm");
    const result = await performInternalTransfer({
      userId: ids.user!,
      fromAccountId: ids.a1!,
      toAccountId: ids.a2!,
      amount: "30",
      currency: "USD",
    });
    expect(result.pairId).toBeTruthy();

    const rows = await db
      .select({ id: schema.accounts.id, balance: schema.accounts.balance })
      .from(schema.accounts)
      .where(eq(schema.accounts.userId, ids.user!));
    const bal = Object.fromEntries(rows.map((r) => [r.id, Number(r.balance)]));
    expect(bal[ids.a1!]).toBe(70);
    expect(bal[ids.a2!]).toBe(30);

    // Two ledger rows, netting to zero.
    const txs = await db
      .select({ txType: schema.transactions.txType, amount: schema.transactions.sourceAmount })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, ids.user!));
    const net = txs.reduce(
      (s, t) => s + (t.txType === "internal_in" ? Number(t.amount) : -Number(t.amount)),
      0
    );
    expect(net).toBe(0);
    void sql;
  });

  it("refuses to overdraw and leaves balances untouched", async () => {
    await expect(
      performInternalTransfer({
        userId: ids.user!,
        fromAccountId: ids.a1!,
        toAccountId: ids.a2!,
        amount: "999999",
        currency: "USD",
      })
    ).rejects.toThrow(INSUFFICIENT_FUNDS);

    const { eq } = await import("drizzle-orm");
    const [a1] = await db
      .select({ balance: schema.accounts.balance })
      .from(schema.accounts)
      .where(eq(schema.accounts.id, ids.a1!));
    expect(Number(a1.balance)).toBe(70); // unchanged from the first test
  });
});
