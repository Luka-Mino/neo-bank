// Row-level security (migration 0021, PRE-DAKOTA-PLAN C1): proves the database
// itself keeps orgs apart, even when application code forgets a filter.
//
// Must run with DATABASE_URL = a role that does NOT bypass RLS (moneta_app)
// and SYSTEM_DATABASE_URL = a bypass role, against a DB migrated through 0021.
// If the app connection can bypass RLS (e.g. a local superuser), the tests skip,
// unless RLS_REQUIRED=1 (set in CI), when they fail instead.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.INTEGRATION === "1";

describe.skipIf(!RUN)("row-level security between orgs (integration)", () => {
  let db: typeof import("@/lib/db").db;
  let sys: typeof import("@/lib/db").systemDb;
  let withOrg: typeof import("@/lib/db/with-org").withOrg;
  let schema: typeof import("@/lib/db/schema");
  let appBypassesRls = true;
  const stamp = Date.now();
  const ids: { userA?: string; userB?: string; orgA?: string; orgB?: string; accA?: string; accB?: string } = {};

  // Skip (locally) or fail (CI) when the app connection isn't restricted.
  function requireRestrictedRole(ctx: { skip: () => void }) {
    if (!appBypassesRls) return;
    if (process.env.RLS_REQUIRED === "1") {
      throw new Error("DATABASE_URL bypasses row-level security; it must be the moneta_app role");
    }
    ctx.skip();
  }

  beforeAll(async () => {
    ({ db, systemDb: sys } = await import("@/lib/db"));
    ({ withOrg } = await import("@/lib/db/with-org"));
    schema = await import("@/lib/db/schema");
    const { sql } = await import("drizzle-orm");

    const [role] = (await db.execute(
      sql`select (rolsuper or rolbypassrls) as bypass from pg_roles where rolname = current_user`
    )) as unknown as { bypass: boolean }[];
    appBypassesRls = role?.bypass ?? true;

    for (const side of ["A", "B"] as const) {
      const [u] = await sys
        .insert(schema.users)
        .values({ email: `itest-rls-${side}-${stamp}@moneta.test`, passwordHash: "x", fullName: `RLS ${side}` })
        .returning();
      const [o] = await sys
        .insert(schema.organizations)
        .values({ name: `RLS Org ${side}`, type: "personal", createdBy: u.id, personalForUserId: u.id })
        .returning();
      const [a] = await sys
        .insert(schema.accounts)
        .values({ orgId: o.id, userId: u.id, accountType: "checking", accountNumber: `rls${stamp}${side}`, balance: "50" })
        .returning();
      ids[`user${side}`] = u.id;
      ids[`org${side}`] = o.id;
      ids[`acc${side}`] = a.id;
    }
  });

  afterAll(async () => {
    const { inArray } = await import("drizzle-orm");
    const orgs = [ids.orgA, ids.orgB].filter(Boolean) as string[];
    const users = [ids.userA, ids.userB].filter(Boolean) as string[];
    if (orgs.length) {
      await sys.delete(schema.transactions).where(inArray(schema.transactions.orgId, orgs));
      await sys.delete(schema.accounts).where(inArray(schema.accounts.orgId, orgs));
      await sys.delete(schema.organizations).where(inArray(schema.organizations.id, orgs));
    }
    if (users.length) await sys.delete(schema.users).where(inArray(schema.users.id, users));
  });

  const both = async () => {
    const { inArray } = await import("drizzle-orm");
    return inArray(schema.accounts.id, [ids.accA!, ids.accB!]);
  };

  it("the app connection with no org set sees no rows", async (ctx) => {
    requireRestrictedRole(ctx);
    const rows = await db.select({ id: schema.accounts.id }).from(schema.accounts).where(await both());
    expect(rows).toHaveLength(0);
  });

  it("inside withOrg(A) only org A's rows are visible", async (ctx) => {
    requireRestrictedRole(ctx);
    const where = await both();
    const rows = await withOrg(ids.orgA!, (tx) => tx.select({ id: schema.accounts.id }).from(schema.accounts).where(where));
    expect(rows.map((r) => r.id)).toEqual([ids.accA]);
  });

  it("org A cannot update or delete org B's rows", async (ctx) => {
    requireRestrictedRole(ctx);
    const { eq } = await import("drizzle-orm");
    const updated = await withOrg(ids.orgA!, (tx) =>
      tx.update(schema.accounts).set({ balance: "0" }).where(eq(schema.accounts.id, ids.accB!)).returning({ id: schema.accounts.id })
    );
    expect(updated).toHaveLength(0);
    const deleted = await withOrg(ids.orgA!, (tx) =>
      tx.delete(schema.accounts).where(eq(schema.accounts.id, ids.accB!)).returning({ id: schema.accounts.id })
    );
    expect(deleted).toHaveLength(0);

    const [b] = await sys.select({ balance: schema.accounts.balance }).from(schema.accounts).where(eq(schema.accounts.id, ids.accB!));
    expect(Number(b.balance)).toBe(50);
  });

  it("org A cannot write a row stamped with org B", async (ctx) => {
    requireRestrictedRole(ctx);
    await expect(
      withOrg(ids.orgA!, (tx) =>
        tx.insert(schema.accounts).values({
          orgId: ids.orgB!,
          userId: ids.userA!,
          accountType: "checking",
          accountNumber: `rls${stamp}X`,
        })
      )
    ).rejects.toThrow();
  });

  it("an org setting never leaks into the next transaction on a pooled connection", async (ctx) => {
    requireRestrictedRole(ctx);
    await withOrg(ids.orgA!, (tx) => tx.select({ id: schema.accounts.id }).from(schema.accounts).limit(1));
    // Same pool, after the withOrg transaction ended: back to seeing nothing,
    // and no "invalid uuid" error from the reset ('') setting.
    for (let i = 0; i < 5; i++) {
      const rows = await db.select({ id: schema.accounts.id }).from(schema.accounts).where(await both());
      expect(rows).toHaveLength(0);
    }
  });

  it("composite FKs stop a row linking to another org's parent, even for the system role", async () => {
    await expect(
      sys.insert(schema.transactions).values({
        orgId: ids.orgA!,
        userId: ids.userA!,
        accountId: ids.accB!, // org B's account
        dakotaTxId: `itest-rls-${stamp}`,
        txType: "internal_out",
        status: "completed",
      })
    ).rejects.toThrow();
  });

  it("the system connection sees every org", async () => {
    const rows = await sys.select({ id: schema.accounts.id }).from(schema.accounts).where(await both());
    expect(rows).toHaveLength(2);
  });
});
