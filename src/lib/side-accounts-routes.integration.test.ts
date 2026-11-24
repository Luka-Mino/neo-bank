// The account and card rules for main + side accounts (SIDE-ACCOUNTS-PLAN.md),
// through the real routes, connected as the restricted app role so row-level
// security is in force. Sign-in is stubbed; the mock card issuer is used.
// Gated like the other integration tests (INTEGRATION=1).
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const RUN = process.env.INTEGRATION === "1";

let session: { user: { id: string; email: string; name?: string; orgId?: string } } | null = null;
vi.mock("@/lib/auth/config", () => ({ auth: async () => session }));

function req(method: string, url: string, body?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json", "x-real-ip": `10.8.${Math.floor(Math.random() * 250)}.1` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe.skipIf(!RUN)("main + side account rules through the routes (integration)", () => {
  let sys: typeof import("@/lib/db").systemDb;
  let schema: typeof import("@/lib/db/schema");
  const stamp = Date.now();
  const ids: { user?: string; org?: string; main?: string; side?: string } = {};
  const prevMode = process.env.SIDE_ACCOUNT_WALLETS;

  beforeAll(async () => {
    delete process.env.SIDE_ACCOUNT_WALLETS; // shared mode: no Dakota calls
    ({ systemDb: sys } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    const [u] = await sys
      .insert(schema.users)
      .values({ email: `itest-sideroutes-${stamp}@moneta.test`, passwordHash: "x", fullName: "Side Routes" })
      .returning();
    const [o] = await sys
      .insert(schema.organizations)
      .values({ name: "Side Routes Org", type: "personal", createdBy: u.id, personalForUserId: u.id })
      .returning();
    ids.user = u.id;
    ids.org = o.id;
    session = { user: { id: u.id, email: "side-routes@moneta.test", name: "Side Routes", orgId: o.id } };
  });

  afterAll(async () => {
    if (prevMode === undefined) delete process.env.SIDE_ACCOUNT_WALLETS;
    else process.env.SIDE_ACCOUNT_WALLETS = prevMode;
    const { eq } = await import("drizzle-orm");
    if (!ids.org) return;
    await sys.delete(schema.cards).where(eq(schema.cards.orgId, ids.org));
    await sys.delete(schema.accounts).where(eq(schema.accounts.orgId, ids.org));
    await sys.delete(schema.organizations).where(eq(schema.organizations.id, ids.org));
    if (ids.user) await sys.delete(schema.users).where(eq(schema.users.id, ids.user));
  });

  it("the first account opened is the main one; the next is a side account", async () => {
    const { POST } = await import("@/app/api/accounts/route");
    const first = await POST(req("POST", "/api/accounts", { nickname: "Main" }));
    expect(first.status).toBe(201);
    const main = (await first.json()).data;
    expect(main).toMatchObject({ isPrimary: true, orgId: ids.org });

    const second = await POST(req("POST", "/api/accounts", { nickname: "Bills" }));
    expect(second.status).toBe(201);
    const side = (await second.json()).data;
    expect(side).toMatchObject({ isPrimary: false, status: "active", walletId: null });
    ids.main = main.id;
    ids.side = side.id;
  });

  it("one live card per account", async () => {
    const { POST } = await import("@/app/api/cards/route");
    const first = await POST(req("POST", "/api/cards", { accountId: ids.side, cardType: "virtual" }));
    expect(first.status).toBe(201);
    const again = await POST(req("POST", "/api/cards", { accountId: ids.side, cardType: "virtual" }));
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({ error: { reason: "account_has_card" } });
  });

  it("the main account can't be swapped", async () => {
    const { PATCH } = await import("@/app/api/accounts/[id]/route");
    const res = await PATCH(req("PATCH", `/api/accounts/${ids.side}`, { setPrimary: true }), ctx(ids.side!));
    expect(res.status).toBe(409);
    const { eq } = await import("drizzle-orm");
    const [main] = await sys.select().from(schema.accounts).where(eq(schema.accounts.id, ids.main!));
    expect(main.isPrimary).toBe(true);
  });

  it("the main account can't close while a side account is open", async () => {
    const { DELETE } = await import("@/app/api/accounts/[id]/route");
    const res = await DELETE(req("DELETE", `/api/accounts/${ids.main}`), ctx(ids.main!));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { reason: "side_accounts_open" } });
  });
});
