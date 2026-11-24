// The CI guard behind row-level security (scripts/check-db-access.mjs) must
// catch the patterns that would silently return nothing under RLS, and must
// not trip on the legitimate ones.
import { describe, expect, it } from "vitest";
import { checkSource } from "../../../scripts/check-db-access.mjs";

const check = (path: string, src: string) => checkSource(path, src) as string[];

describe("check-db-access", () => {
  it("flags a protected-table query on the global db", () => {
    const src = `import { db } from "@/lib/db";\nimport { accounts } from "@/lib/db/schema";\nawait db.select({ id: accounts.id })\n  .from(accounts).where(x);`;
    expect(check("src/app/api/x/route.ts", src)).toHaveLength(1);
  });

  it("flags insert/update/delete and dynamic imports too", () => {
    const src = `const { db } = await import("@/lib/db");\nawait db.update(transactions).set({});\nawait db.insert(wallets).values({});`;
    const [p] = check("src/lib/x.ts", src);
    expect(p).toMatch(/transactions, .*wallets|wallets, .*transactions/);
  });

  it("allows the global db for non-protected tables", () => {
    const src = `import { db } from "@/lib/db";\nawait db.insert(users).values({});\nawait db.select().from(notifications);`;
    expect(check("src/app/api/x/route.ts", src)).toEqual([]);
  });

  it("allows protected tables through withOrg or the handler's ctx.db", () => {
    const viaWithOrg = `import { db } from "@/lib/db";\nawait withOrg(orgId, (tx) => tx.select().from(accounts));\nawait db.insert(users).values({});`;
    const viaCtx = `export const GET = apiHandler({ orgScoped: true, handler: async ({ db }) => db.select().from(accounts) });`;
    expect(check("src/app/api/a/route.ts", viaWithOrg)).toEqual([]);
    expect(check("src/app/api/b/route.ts", viaCtx)).toEqual([]);
  });

  it("ignores type-only imports and commented-out code", () => {
    const src = `import type { db } from "@/lib/db";\n// await db.select().from(accounts);\nexport type X = typeof db;`;
    expect(check("src/lib/x.ts", src)).toEqual([]);
  });

  it("only allowlisted files may import systemDb, even aliased as db", () => {
    const src = `import { systemDb as db } from "@/lib/db";\nawait db.select().from(accounts);`;
    expect(check("src/app/api/rogue/route.ts", src)).toHaveLength(1);
    expect(check("src/lib/dakota/webhook-handlers.ts", src)).toEqual([]);
  });

  it("lets tests use systemDb for fixtures", () => {
    const src = `({ systemDb: db } = await import("@/lib/db"));`;
    expect(check("src/lib/foo.integration.test.ts", src)).toEqual([]);
  });
});

describe("check-db-access: unscoped routes", () => {
  it("flags ctx.db on protected tables in a route that isn't orgScoped", () => {
    const src = `export const POST = apiHandler({\n  handler: async ({ user, db }) => {\n    await db.insert(recipients).values({});\n  },\n});`;
    expect(check("src/app/api/x/route.ts", src)).toHaveLength(1);
  });

  it("allows it when the route is orgScoped, or when withOrg is used", () => {
    const scoped = `export const POST = apiHandler({\n  orgScoped: true,\n  handler: async ({ user, db }) => db.insert(recipients).values({}),\n});`;
    const wrapped = `export const POST = apiHandler({\n  handler: async ({ user }) => withOrg(orgId, (tx) => tx.insert(recipients).values({})),\n});`;
    expect(check("src/app/api/a/route.ts", scoped)).toEqual([]);
    expect(check("src/app/api/b/route.ts", wrapped)).toEqual([]);
  });
});
