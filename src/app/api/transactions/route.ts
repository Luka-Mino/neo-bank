// Transactions API.
// GET  /api/transactions[?accountId=…] → all caller's tx, optionally
//                                        scoped to one of their accounts
// POST /api/transactions               → two-leg Dakota withdrawal/send:
//        1. create the Dakota one-off transfer (funding instructions only —
//           no money moves yet) to learn send_amount (fees included)
//        2. atomically place a hold: debit the source account by send_amount
//        3. on-chain leg: wallet-send exactly send_amount to the one-off's
//           deposit address, signed by the platform signer
//        Webhooks finalize; terminal failure or ACH return refunds the hold
//        (see onOneOffTransaction in src/lib/dakota/webhook-handlers.ts).

import { and, desc, eq, sql } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import {
  accounts,
  transactions,
  dakotaCustomers,
  wallets,
} from "@/lib/db/schema";
import {
  createTransaction as createDakotaTransaction,
  cancelTransaction as cancelDakotaTransaction,
} from "@/lib/dakota/transactions";
import { DakotaApiError } from "@/lib/dakota/client";
import { sendWalletTransaction } from "@/lib/dakota/wallet-transactions";
import { deterministicIdempotencyKey } from "@/lib/dakota/idempotency";
import { defaultNetworkId, isSupportedNetwork } from "@/lib/dakota/networks";
import { randomBytes } from "node:crypto";
import { logStatusChange } from "@/lib/transaction-history";
import { createTransactionSchema } from "@/lib/validators/transaction";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const GET = apiHandler({
  handler: async ({ user, request }) => {
    const accountId = request.nextUrl.searchParams.get("accountId");
    const limit = Math.min(
      Number(request.nextUrl.searchParams.get("limit") ?? "50"),
      200
    );

    if (accountId) {
      // Account-scope: must own the account.
      try {
        await assertAccountOwnership(accountId, user.id);
      } catch (e) {
        const o = ownershipErr(e);
        if (o) return err(o.message, o.status);
        throw e;
      }
    }

    const where = accountId
      ? and(
          eq(transactions.userId, user.id),
          eq(transactions.accountId, accountId)
        )
      : eq(transactions.userId, user.id);

    const txs = await db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return ok({ data: txs });
  },
});

export const POST = apiHandler({
  schema: createTransactionSchema,
  rateLimit: { limit: 30, window: "1h" },
  handler: async ({ user, body }) => {
    const [customer] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (
      !isKycBypassed() &&
      (!customer || customer.kycStatus !== "active")
    ) {
      return err("KYC verification required", 403);
    }

    // Caller must own the account this tx will debit.
    let account;
    try {
      account = await assertAccountOwnership(body.accountId, user.id);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }
    if (account.status !== "active") {
      return err("Source account is not active", 409);
    }

    const sourceNetworkId = body.sourceNetworkId ?? defaultNetworkId();
    if (!isSupportedNetwork(sourceNetworkId)) {
      return err(`Unsupported source network: ${sourceNetworkId}`, 400);
    }

    // Statement reference the recipient's bank shows. ACH allows ≤18 chars,
    // letters/digits/spaces only — "MONETA " + 8 base36 chars fits.
    const paymentReference =
      body.paymentReference ??
      `MONETA ${randomBytes(6).readUIntBE(0, 6).toString(36).toUpperCase().padStart(8, "0").slice(-8)}`;

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);
    if (!wallet) {
      return err(
        "Account setup incomplete — no wallet found. Retry setup from the onboarding page.",
        409
      );
    }

    // Leg 1: create the Dakota one-off. This only reserves funding
    // instructions (single-use deposit address + send_amount); nothing has
    // moved yet, so failing after this point is recoverable.
    const dakotaTx = await createDakotaTransaction(
      {
        amount: body.amount,
        customerId: customer?.dakotaCustomerId ?? "",
        sourceNetworkId,
        sourceAsset: body.sourceAsset,
        destinationId: body.destinationId,
        destinationAsset: body.destinationAsset,
        destinationNetworkId: body.destinationNetworkId,
        destinationPaymentRail: body.destinationPaymentRail,
        paymentReference,
      }
    );

    // send_amount includes Dakota's fees and can exceed the requested
    // amount — it is what actually leaves the user's balance.
    const sendAmount = dakotaTx.send_amount || body.amount;

    // Hold: debit the source account and write the ledger row atomically.
    let ledger;
    try {
      ledger = await db.transaction(async (tx) => {
        const debit = await tx
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} - ${sendAmount}::numeric`,
            updatedAt: new Date(),
          })
          .where(
            sql`${accounts.id} = ${account.id} AND ${accounts.balance} >= ${sendAmount}::numeric AND ${accounts.status} = 'active'`
          )
          .returning({ id: accounts.id });
        if (debit.length === 0) {
          throw new Error("INSUFFICIENT_FUNDS_RACE");
        }

        const [row] = await tx
          .insert(transactions)
          .values({
            userId: user.id,
            accountId: account.id,
            dakotaTxId: dakotaTx.id,
            txType: body.txType,
            status: dakotaTx.status || "pending",
            sourceAsset: body.sourceAsset,
            destinationAsset: body.destinationAsset,
            sourceAmount: sendAmount,
            destinationAmount: body.amount,
            sourceNetwork: sourceNetworkId,
            destinationNetwork: body.destinationNetworkId,
            destinationId: body.destinationId,
            metadata: {
              ...(dakotaTx as unknown as Record<string, unknown>),
              moneta_debited: true,
              moneta_debited_amount: sendAmount,
            },
          })
          .returning();
        return row;
      });
    } catch (e) {
      if (e instanceof Error && e.message === "INSUFFICIENT_FUNDS_RACE") {
        // Nothing was funded — release Dakota's side (best effort).
        await cancelDakotaTransaction(dakotaTx.id).catch(() => {});
        return err(
          `Insufficient balance: this transfer requires ${sendAmount} ${body.sourceAsset} including fees`,
          402
        );
      }
      throw e;
    }
    await logStatusChange({
      transactionId: ledger.id,
      oldStatus: null,
      newStatus: ledger.status,
    });

    // Leg 2: on-chain — send exactly send_amount from the user's wallet to
    // the one-off's single-use deposit address.
    try {
      const walletTx = await sendWalletTransaction({
        walletId: wallet.dakotaWalletId,
        from: wallet.address,
        to: dakotaTx.crypto_address,
        amount: sendAmount,
        assetId: body.sourceAsset,
        networkId: sourceNetworkId,
        idempotencyKey: deterministicIdempotencyKey(`wallet-send:${dakotaTx.id}`),
      });

      // Ledger row for the on-chain leg so wallet.transaction.* webhooks
      // have something to update; linked to the withdrawal via metadata.
      await db
        .insert(transactions)
        .values({
          userId: user.id,
          accountId: account.id,
          dakotaTxId: walletTx.id,
          txType: "wallet_send",
          status: walletTx.status,
          sourceAsset: body.sourceAsset,
          sourceAmount: sendAmount,
          sourceNetwork: sourceNetworkId,
          transactionHash: walletTx.transaction_hash,
          metadata: { one_off_id: dakotaTx.id, purpose: "withdrawal_funding" },
        })
        .onConflictDoNothing({ target: transactions.dakotaTxId });

      await db
        .update(transactions)
        .set({
          metadata: {
            ...(ledger.metadata as Record<string, unknown>),
            wallet_tx_id: walletTx.id,
          },
        })
        .where(eq(transactions.id, ledger.id));

      return ok({ transaction: ledger, sendAmount, walletTransaction: walletTx }, 201);
    } catch (e) {
      // Only refund when we KNOW the send was rejected (4xx: policy denial,
      // validation…). On network errors / 5xx the send may still have gone
      // through — keep the hold and let webhooks/reconciliation settle it,
      // rather than risk refunding money that also leaves the wallet.
      if (e instanceof DakotaApiError && e.status < 500) {
        await db.transaction(async (tx) => {
          const [row] = await tx
            .select({ id: transactions.id, metadata: transactions.metadata })
            .from(transactions)
            .where(eq(transactions.id, ledger.id))
            .for("update");
          const meta = (row?.metadata ?? {}) as Record<string, unknown>;
          if (row && meta.moneta_debited === true) {
            await tx
              .update(accounts)
              .set({
                balance: sql`${accounts.balance} + ${sendAmount}::numeric`,
                updatedAt: new Date(),
              })
              .where(eq(accounts.id, account.id));
            await tx
              .update(transactions)
              .set({
                status: "failed",
                metadata: {
                  ...meta,
                  moneta_debited: false,
                  wallet_leg_error: e.message,
                },
                updatedAt: new Date(),
              })
              .where(eq(transactions.id, row.id));
          }
        });
        await logStatusChange({
          transactionId: ledger.id,
          oldStatus: ledger.status,
          newStatus: "failed",
          reason: `wallet leg rejected: ${e.detail}`,
        });
        await cancelDakotaTransaction(dakotaTx.id).catch(() => {});
        return err(
          "Transfer could not be sent from your wallet — your balance was not charged.",
          502
        );
      }

      console.error("Withdrawal wallet leg uncertain, keeping hold:", e);
      await db
        .update(transactions)
        .set({
          metadata: {
            ...(ledger.metadata as Record<string, unknown>),
            wallet_leg_pending_retry: true,
          },
        })
        .where(eq(transactions.id, ledger.id));
      return ok(
        {
          transaction: ledger,
          sendAmount,
          warning:
            "Transfer initiated but confirmation is pending — status will update shortly.",
        },
        202
      );
    }
  },
});
