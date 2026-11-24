// Main account + side accounts (SIDE-ACCOUNTS-PLAN.md, decision D18).
//
// Every org has one MAIN account (the primary), whose money lives in the
// org's main Dakota wallet; deposits land there. SIDE accounts each get their
// own Dakota wallet, so a side account's card can only spend that account's
// money. `accounts.wallet_id` says where an account's money lives (NULL = the
// main wallet).
//
// SIDE_ACCOUNT_WALLETS switches the behaviour:
//   "shared" (default, until Phase 2 is verified in Dakota's sandbox): a side
//            account is created on the main wallet, exactly as accounts were
//            before. Transfers between accounts stay instant book entries.
//   "dakota": a side account is created as "opening", gets its own Dakota
//            wallet, then becomes "active". Transfers between different
//            wallets are on-chain (Phase 2); until then they're refused.

import { and, eq, ne } from "drizzle-orm";
import { withOrg, type DbTx } from "@/lib/db/with-org";
import { accounts, dakotaCustomers, wallets } from "@/lib/db/schema";
import { generateAccountNumber } from "@/lib/accounts";
import { deterministicIdempotencyKey } from "@/lib/dakota/idempotency";
import { createWallet as dakotaCreateWallet } from "@/lib/dakota/wallets";

export type SideWalletMode = "shared" | "dakota";
export type Account = typeof accounts.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;

/** A product cap, well under Dakota's (unpublished) cards-per-person maximum. */
export const MAX_SIDE_ACCOUNTS = 10;

export function sideWalletMode(env: Record<string, string | undefined> = process.env): SideWalletMode {
  return env.SIDE_ACCOUNT_WALLETS === "dakota" ? "dakota" : "shared";
}

/** Shown to the customer as-is. */
export class SideAccountError extends Error {
  constructor(
    message: string,
    readonly reason: "no_main_account" | "main_not_ready" | "limit_reached" | "not_found"
  ) {
    super(message);
    this.name = "SideAccountError";
  }
}

// ─── Which wallet holds an account's money ───────────────────────────────────

export async function mainWallet(tx: DbTx, orgId: string): Promise<Wallet | null> {
  const [w] = await tx
    .select()
    .from(wallets)
    .where(and(eq(wallets.orgId, orgId), eq(wallets.purpose, "main")))
    .limit(1);
  return w ?? null;
}

export async function walletForAccount(
  tx: DbTx,
  account: Pick<Account, "orgId" | "walletId">
): Promise<Wallet | null> {
  if (!account.walletId) return mainWallet(tx, account.orgId);
  const [w] = await tx
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, account.walletId), eq(wallets.orgId, account.orgId)))
    .limit(1);
  return w ?? null;
}

/**
 * How money moves between two accounts: a book entry when both live in the
 * same wallet (NULL = main wallet), on-chain when they don't.
 */
export function transferRoute(
  from: Pick<Account, "walletId">,
  to: Pick<Account, "walletId">
): "book" | "onchain" {
  return (from.walletId ?? null) === (to.walletId ?? null) ? "book" : "onchain";
}

// ─── Opening a side account ──────────────────────────────────────────────────

export interface SideAccountDeps {
  createWallet: typeof dakotaCreateWallet;
  env: Record<string, string | undefined>;
}

const defaultDeps: SideAccountDeps = { createWallet: dakotaCreateWallet, env: process.env };

/**
 * Open a side account for an org that already has its main account. In
 * "dakota" mode this creates the account's own wallet; a failure part-way
 * leaves the account "opening", and finishOpeningSideAccount resumes it.
 */
export async function openSideAccount(
  params: { orgId: string; userId: string; nickname: string },
  deps: SideAccountDeps = defaultDeps
): Promise<Account> {
  const mode = sideWalletMode(deps.env);
  const { orgId, userId, nickname } = params;

  const account = await withOrg(orgId, async (tx) => {
    const open = await tx
      .select({ id: accounts.id, isPrimary: accounts.isPrimary })
      .from(accounts)
      .where(and(eq(accounts.orgId, orgId), ne(accounts.status, "closed")));
    if (!open.some((a) => a.isPrimary)) {
      throw new SideAccountError("Open your main account first.", "no_main_account");
    }
    if (open.filter((a) => !a.isPrimary).length >= MAX_SIDE_ACCOUNTS) {
      throw new SideAccountError(
        `You can have up to ${MAX_SIDE_ACCOUNTS} side accounts. Close one you don't use to open another.`,
        "limit_reached"
      );
    }
    if (mode === "dakota" && !(await mainWallet(tx, orgId))) {
      throw new SideAccountError(
        "Finish setting up your main account first, then you can open side accounts.",
        "main_not_ready"
      );
    }

    // Retry on the rare account-number collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [row] = await tx
          .insert(accounts)
          .values({
            orgId,
            userId,
            accountType: "checking", // internal only, never shown
            nickname,
            accountNumber: generateAccountNumber(),
            isPrimary: false,
            status: mode === "dakota" ? "opening" : "active",
          })
          .returning();
        return row;
      } catch (e) {
        if (!(e instanceof Error) || !e.message.includes("accounts_account_number") || attempt === 2) throw e;
      }
    }
    throw new Error("unreachable");
  });

  if (mode === "shared") return account;
  return finishOpeningSideAccount({ orgId, accountId: account.id }, deps);
}

/** Create (or re-use) the side account's own Dakota wallet and activate it. Idempotent. */
export async function finishOpeningSideAccount(
  params: { orgId: string; accountId: string },
  deps: SideAccountDeps = defaultDeps
): Promise<Account> {
  const { orgId, accountId } = params;

  const state = await withOrg(orgId, async (tx) => {
    const [account] = await tx
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.orgId, orgId)))
      .limit(1);
    if (!account) throw new SideAccountError("That account wasn't found.", "not_found");
    const [customer] = await tx
      .select({ dakotaCustomerId: dakotaCustomers.dakotaCustomerId, kycStatus: dakotaCustomers.kycStatus })
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, orgId))
      .limit(1);
    return { account, customer };
  });
  if (state.account.status !== "opening") return state.account;
  if (!state.customer || state.customer.kycStatus !== "active") {
    throw new SideAccountError(
      "Finish setting up your main account first, then you can open side accounts.",
      "main_not_ready"
    );
  }

  const signerGroup = deps.env.DAKOTA_SIGNER_GROUP_ID;
  const policy = deps.env.DAKOTA_POLICY_ID;
  if (!signerGroup || !policy) {
    throw new Error("Side account wallets need DAKOTA_SIGNER_GROUP_ID and DAKOTA_POLICY_ID (npm run dakota:bootstrap)");
  }

  // Dakota call outside any DB transaction; the key makes retries safe.
  const dakotaWallet = await deps.createWallet(
    {
      customerId: state.customer.dakotaCustomerId,
      name: `${state.account.nickname ?? "Side account"} — Moneta`,
      family: "evm",
      signerGroups: [signerGroup],
      policies: [policy],
    },
    { idempotencyKey: deterministicIdempotencyKey(`side-wallet:${accountId}`) }
  );

  return withOrg(orgId, async (tx) => {
    let [wallet] = await tx
      .insert(wallets)
      .values({
        orgId,
        userId: state.account.userId,
        dakotaWalletId: dakotaWallet.id,
        family: dakotaWallet.family,
        address: dakotaWallet.address,
        name: dakotaWallet.name,
        purpose: "side",
      })
      .onConflictDoNothing({ target: wallets.dakotaWalletId })
      .returning();
    if (!wallet) {
      [wallet] = await tx.select().from(wallets).where(eq(wallets.dakotaWalletId, dakotaWallet.id)).limit(1);
    }
    const [activated] = await tx
      .update(accounts)
      .set({ walletId: wallet.id, status: "active", updatedAt: new Date() })
      .where(and(eq(accounts.id, accountId), eq(accounts.status, "opening")))
      .returning();
    if (activated) return activated;
    // Another request finished it first.
    const [current] = await tx.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
    return current;
  });
}
