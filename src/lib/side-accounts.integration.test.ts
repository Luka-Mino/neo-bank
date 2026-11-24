// Side accounts (SIDE-ACCOUNTS-PLAN.md Phase 1) against a real Postgres, as
// the restricted app role. Dakota's wallet creation is stubbed. Gated like
// the other integration tests (INTEGRATION=1).
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const RUN = process.env.INTEGRATION === "1";

describe.skipIf(!RUN)("side accounts (integration)", () => {
  let sys: typeof import("@/lib/db").systemDb;
  let withOrg: typeof import("@/lib/db/with-org").withOrg;
  let schema: typeof import("@/lib/db/schema");
  let lib: typeof import("@/lib/side-accounts");
  let transfers: typeof import("@/lib/transfers");
  const stamp = Date.now();
  const ids: { user?: string; org?: string; main?: string; mainWallet?: string } = {};
  const envDakota = { SIDE_ACCOUNT_WALLETS: "dakota", DAKOTA_SIGNER_GROUP_ID: "sg_test", DAKOTA_POLICY_ID: "pol_test" };
  let walletN = 0;
  const createWallet = vi.fn(async () => {
    walletN++;
    return {
      id: `dwal_side_${stamp}_${walletN}`,
      client_id: "c",
      customer_id: "dcus",
      family: "evm",
      address: `0x${String(walletN).padStart(40, "a")}`,
      name: "Side — Moneta",
      created_at: new Date().toISOString(),
    };
  });

  beforeAll(async () => {
    ({ systemDb: sys } = await import("@/lib/db"));
    ({ withOrg } = await import("@/lib/db/with-org"));
    schema = await import("@/lib/db/schema");
    lib = await import("@/lib/side-accounts");
    transfers = await import("@/lib/transfers");

    const [u] = await sys.insert(schema.users).values({ email: `itest-side-${stamp}@moneta.test`, passwordHash: "x", fullName: "Side Test" }).returning();
    const [o] = await sys.insert(schema.organizations).values({ name: "Side Org", type: "personal", createdBy: u.id, personalForUserId: u.id }).returning();
    await sys.insert(schema.dakotaCustomers).values({ orgId: o.id, userId: u.id, dakotaCustomerId: `dcus_side_${stamp}`, kycStatus: "active" });
    const [w] = await sys
      .insert(schema.wallets)
      .values({ orgId: o.id, userId: u.id, dakotaWalletId: `dwal_main_${stamp}`, family: "evm", address: "0xmain", name: "Main", purpose: "main" })
      .returning();
    const [a] = await sys
      .insert(schema.accounts)
      .values({ orgId: o.id, userId: u.id, accountType: "checking", nickname: "Main", accountNumber: `side${stamp}0`, isPrimary: true, balance: "100" })
      .returning();
    Object.assign(ids, { user: u.id, org: o.id, main: a.id, mainWallet: w.id });
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    if (!ids.org) return;
    await sys.delete(schema.transactions).where(eq(schema.transactions.orgId, ids.org));
    await sys.delete(schema.accounts).where(eq(schema.accounts.orgId, ids.org));
    await sys.delete(schema.wallets).where(eq(schema.wallets.orgId, ids.org));
    await sys.delete(schema.dakotaCustomers).where(eq(schema.dakotaCustomers.orgId, ids.org));
    await sys.delete(schema.organizations).where(eq(schema.organizations.id, ids.org));
    if (ids.user) await sys.delete(schema.users).where(eq(schema.users.id, ids.user));
  });

  it("shared mode: a side account lives in the main wallet, and transfers stay book entries", async () => {
    const side = await lib.openSideAccount({ orgId: ids.org!, userId: ids.user!, nickname: "Bills" }, { createWallet, env: {} });
    expect(side).toMatchObject({ isPrimary: false, status: "active", walletId: null });
    expect(createWallet).not.toHaveBeenCalled();

    const result = await withOrg(ids.org!, (tx) =>
      transfers.performInternalTransfer(
        { orgId: ids.org!, userId: ids.user!, fromAccountId: ids.main!, toAccountId: side.id, amount: "10", currency: "USD" },
        tx
      )
    );
    expect(result.pairId).toBeTruthy();
  });

  it("dakota mode: a side account gets its own wallet, idempotently", async () => {
    const side = await lib.openSideAccount({ orgId: ids.org!, userId: ids.user!, nickname: "Holiday" }, { createWallet, env: envDakota });
    expect(side.status).toBe("active");
    expect(side.walletId).toBeTruthy();
    expect(createWallet).toHaveBeenCalledTimes(1);
    const [, opts] = createWallet.mock.calls[0] as unknown as [unknown, { idempotencyKey: string }];
    expect(opts.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);

    const wallet = await withOrg(ids.org!, (tx) => lib.walletForAccount(tx, side));
    expect(wallet).toMatchObject({ purpose: "side", id: side.walletId });
    const main = await withOrg(ids.org!, (tx) => lib.mainWallet(tx, ids.org!));
    expect(main?.id).toBe(ids.mainWallet);

    // Resuming an already-active account doesn't create another wallet.
    const again = await lib.finishOpeningSideAccount({ orgId: ids.org!, accountId: side.id }, { createWallet, env: envDakota });
    expect(again.walletId).toBe(side.walletId);
    expect(createWallet).toHaveBeenCalledTimes(1);
  });

  it("dakota mode: a Dakota failure leaves the account 'opening', and a retry finishes it", async () => {
    const failing = vi.fn(async () => {
      throw new Error("dakota down");
    });
    await expect(
      lib.openSideAccount({ orgId: ids.org!, userId: ids.user!, nickname: "Car" }, { createWallet: failing as never, env: envDakota })
    ).rejects.toThrow("dakota down");
    const { and, eq } = await import("drizzle-orm");
    const [stuck] = await sys
      .select()
      .from(schema.accounts)
      .where(and(eq(schema.accounts.orgId, ids.org!), eq(schema.accounts.nickname, "Car")));
    expect(stuck.status).toBe("opening");

    const done = await lib.finishOpeningSideAccount({ orgId: ids.org!, accountId: stuck.id }, { createWallet, env: envDakota });
    expect(done).toMatchObject({ status: "active" });
    expect(done.walletId).toBeTruthy();
  });

  it("refuses a book transfer between accounts in different wallets (Phase 2)", async () => {
    const { and, eq } = await import("drizzle-orm");
    const [holiday] = await sys
      .select()
      .from(schema.accounts)
      .where(and(eq(schema.accounts.orgId, ids.org!), eq(schema.accounts.nickname, "Holiday")));
    await expect(
      withOrg(ids.org!, (tx) =>
        transfers.performInternalTransfer(
          { orgId: ids.org!, userId: ids.user!, fromAccountId: ids.main!, toAccountId: holiday.id, amount: "5", currency: "USD" },
          tx
        )
      )
    ).rejects.toThrow(transfers.CROSS_WALLET_TRANSFER);
    const [main] = await sys.select({ balance: schema.accounts.balance }).from(schema.accounts).where(eq(schema.accounts.id, ids.main!));
    expect(Number(main.balance)).toBe(90); // only the shared-mode $10 moved
  });

  it("caps the number of side accounts", async () => {
    const env = {};
    const { and, eq, ne } = await import("drizzle-orm");
    const open = await sys
      .select({ id: schema.accounts.id })
      .from(schema.accounts)
      .where(and(eq(schema.accounts.orgId, ids.org!), eq(schema.accounts.isPrimary, false), ne(schema.accounts.status, "closed")));
    for (let i = open.length; i < lib.MAX_SIDE_ACCOUNTS; i++) {
      await lib.openSideAccount({ orgId: ids.org!, userId: ids.user!, nickname: `Pot ${i}` }, { createWallet, env });
    }
    await expect(
      lib.openSideAccount({ orgId: ids.org!, userId: ids.user!, nickname: "One too many" }, { createWallet, env })
    ).rejects.toMatchObject({ reason: "limit_reached" });
  });
});
