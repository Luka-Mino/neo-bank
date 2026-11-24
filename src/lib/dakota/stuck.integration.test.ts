// Stuck-transaction sweep (PRE-DAKOTA-PLAN C4), against a real Postgres.
// Gated like the other integration tests (INTEGRATION=1).
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.INTEGRATION === "1";

describe.skipIf(!RUN)("findStuckTransactions (integration)", () => {
  let sys: typeof import("@/lib/db").systemDb;
  let schema: typeof import("@/lib/db/schema");
  let findStuckTransactions: typeof import("@/lib/dakota/reconcile").findStuckTransactions;
  const stamp = Date.now();
  const ids: { user?: string; org?: string; tx: Record<string, string> } = { tx: {} };

  beforeAll(async () => {
    ({ systemDb: sys } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    ({ findStuckTransactions } = await import("@/lib/dakota/reconcile"));

    const [u] = await sys
      .insert(schema.users)
      .values({ email: `itest-stuck-${stamp}@moneta.test`, passwordHash: "x", fullName: "Stuck" })
      .returning();
    const [o] = await sys
      .insert(schema.organizations)
      .values({ name: "Stuck Org", type: "personal", createdBy: u.id, personalForUserId: u.id })
      .returning();
    ids.user = u.id;
    ids.org = o.id;

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const cases: [string, string, Date][] = [
      ["oldPending", "pending", twoDaysAgo],
      ["freshPending", "pending", new Date()],
      ["oldCompleted", "completed", twoDaysAgo],
      ["oldReturnWindow", "pending_return", twoDaysAgo],
      ["oldFailed", "failed", twoDaysAgo],
    ];
    for (const [key, status, updatedAt] of cases) {
      const [row] = await sys
        .insert(schema.transactions)
        .values({
          orgId: o.id,
          userId: u.id,
          dakotaTxId: `itest-stuck-${stamp}-${key}`,
          txType: "withdrawal",
          status,
          updatedAt,
        })
        .returning({ id: schema.transactions.id });
      ids.tx[key] = row.id;
    }
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    if (ids.org) {
      await sys.delete(schema.transactions).where(eq(schema.transactions.orgId, ids.org));
      await sys.delete(schema.organizations).where(eq(schema.organizations.id, ids.org));
    }
    if (ids.user) await sys.delete(schema.users).where(eq(schema.users.id, ids.user));
  });

  it("finds only old, non-final transactions", async () => {
    const { sample } = await findStuckTransactions(24, 500);
    const mine = sample.filter((s) => Object.values(ids.tx).includes(s.id)).map((s) => s.id);
    expect(mine).toEqual([ids.tx.oldPending]);
  });
});
