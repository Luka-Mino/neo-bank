import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accounts,
  dakotaCustomers,
  dakotaRails,
  transactions,
  wallets,
} from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { logStatusChange } from "@/lib/transaction-history";
import { createNotification } from "@/lib/notifications";
import type { DakotaEventEnvelope } from "./webhooks";
import {
  CLAWBACK_STATUSES,
  isTransitionAllowed,
  isValidAmount,
  ledgerTxType,
} from "./transaction-transitions";

type EventObject = Record<string, unknown>;
type Handler = (object: EventObject, envelope: DakotaEventEnvelope) => Promise<void>;

/**
 * Registry of Dakota webhook handlers. Every handler must be idempotent:
 * Dakota delivers at-least-once, retries for 48h, and does not guarantee
 * lifecycle order — the status field is the source of truth, never arrival
 * order. Events without a registered handler are acknowledged as no-ops
 * (we register a global target, so unhandled types are expected).
 */
export const handlers: Record<string, Handler> = {
  // Sandbox kyb_approve emits .created; production updates emit .updated.
  "customer.kyb_status.created": onKybStatus,
  "customer.kyb_status.updated": onKybStatus,
  "transaction.auto.created": onAutoTransaction,
  "transaction.auto.updated": onAutoTransaction,
  "transaction.one_off.created": onOneOffTransaction,
  "transaction.one_off.updated": onOneOffTransaction,
  "wallet.transaction.created": onWalletTransaction,
  "wallet.transaction.updated": onWalletTransaction,
  "wallet.deposit": onWalletDeposit,
  "auto_account.created": onAutoAccount,
  "auto_account.updated": onAutoAccount,
};

// ─── KYC / KYB ───────────────────────────────────────────────────────────────

async function onKybStatus(object: EventObject) {
  // The object may be a customer resource ({id, kyb_status}) or the slim
  // shape ({customer_id, kyb_status}) shown in parts of the docs.
  const customerId = (object.customer_id ?? object.id) as string | undefined;
  const kybStatus = object.kyb_status as string | undefined;
  const reasonCode = object.reason_code as string | undefined;
  if (!customerId || !kybStatus) return;

  const [customer] = await db
    .select({
      userId: dakotaCustomers.userId,
      kycStatus: dakotaCustomers.kycStatus,
      kycReasonCode: dakotaCustomers.kycReasonCode,
    })
    .from(dakotaCustomers)
    .where(eq(dakotaCustomers.dakotaCustomerId, customerId))
    .limit(1);
  if (!customer) return; // not a customer we know about

  // Only notify on actual change — this handler re-runs on Dakota's retries
  // (e.g. when provisioning below threw on a previous attempt). reason_code
  // can change while status stays "active" (proof-of-address holds), so it
  // counts as a change too. proof_of_address_approved clears the stored code.
  const nextReasonCode =
    reasonCode === "proof_of_address_approved" ? null : (reasonCode ?? null);
  const statusChanged = customer.kycStatus !== kybStatus;
  const reasonChanged = (customer.kycReasonCode ?? null) !== nextReasonCode;

  if (statusChanged || reasonChanged) {
    await db
      .update(dakotaCustomers)
      .set({
        kycStatus: kybStatus,
        kycReasonCode: nextReasonCode,
        updatedAt: new Date(),
      })
      .where(eq(dakotaCustomers.dakotaCustomerId, customerId));

    if (reasonCode === "pending_proof_of_address") {
      // Individual crossed the $3,000 / 7-day inbound threshold; deposits are
      // held until a proof-of-address document is approved. Takes precedence:
      // this can arrive while status is (and stays) "active".
      await createNotification({
        userId: customer.userId,
        type: "kyc_update",
        title: "Additional verification needed",
        body: "Please upload a proof of address to keep receiving deposits over the limit.",
        actionUrl: "/onboarding",
      });
    } else if (reasonCode === "proof_of_address_rejected") {
      await createNotification({
        userId: customer.userId,
        type: "kyc_update",
        title: "Proof of address rejected",
        body: "The document you uploaded couldn't be accepted. Please upload a different proof of address.",
        actionUrl: "/onboarding",
      });
    } else if (reasonCode === "proof_of_address_approved") {
      await createNotification({
        userId: customer.userId,
        type: "kyc_update",
        title: "Proof of address approved",
        body: "Thanks — your held deposits will now be processed.",
        actionUrl: "/dashboard",
      });
    } else if (kybStatus === "active" && statusChanged) {
      await createNotification({
        userId: customer.userId,
        type: "kyc_update",
        title: "Identity verified",
        body: "Your identity has been verified. You can now deposit, withdraw, and send funds.",
        actionUrl: "/dashboard",
      });
    } else if (statusChanged) {
      await createNotification({
        userId: customer.userId,
        type: "kyc_update",
        title: `Verification status: ${kybStatus}`,
        body: `Your verification status has been updated to ${kybStatus}.`,
        actionUrl: "/onboarding",
      });
    }

    await logAudit({
      actorType: "system",
      action: "kyc_status_updated",
      resourceType: "customer",
      resourceId: customerId,
      metadata: { status: kybStatus, reasonCode },
    });
  }

  if (kybStatus === "active") {
    // Idempotent — completed steps are skipped. A throw here fails the
    // webhook (500) so Dakota's retries drive provisioning to completion.
    const { provisionCustomer } = await import("./provisioning");
    await provisionCustomer(customer.userId);
  }
}

// ─── Deposits & other auto-account transactions ─────────────────────────────

async function onAutoTransaction(object: EventObject) {
  const dakotaTxId = object.id as string | undefined;
  const autoAccountId = object.auto_account_id as string | undefined;
  const newStatus = object.status as string | undefined;
  const dakotaType = (object.type as string) ?? "onramp";
  if (!dakotaTxId || !newStatus) return;

  const receipt = (object.receipt ?? {}) as Record<string, unknown>;

  // Attribute to a user via the auto account (rail) that generated it.
  let userId: string | undefined;
  if (autoAccountId) {
    const [rail] = await db
      .select({ userId: dakotaRails.userId })
      .from(dakotaRails)
      .where(eq(dakotaRails.dakotaAccountId, autoAccountId))
      .limit(1);
    userId = rail?.userId;
  }

  const txType = ledgerTxType(dakotaType);

  await db.transaction(async (tx) => {
    let [row] = await tx
      .select({
        id: transactions.id,
        status: transactions.status,
        userId: transactions.userId,
        accountId: transactions.accountId,
        metadata: transactions.metadata,
      })
      .from(transactions)
      .where(eq(transactions.dakotaTxId, dakotaTxId))
      .for("update");

    if (!row) {
      // Deposits originate outside our app — first webhook creates the row.
      if (!userId) {
        throw new Error(
          `auto transaction ${dakotaTxId}: unknown auto_account_id ${autoAccountId}`
        );
      }
      const [primary] = await tx
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, userId),
            eq(accounts.isPrimary, true),
            ne(accounts.status, "closed")
          )
        )
        .limit(1);

      const [inserted] = await tx
        .insert(transactions)
        .values({
          userId,
          accountId: primary?.id,
          dakotaTxId,
          txType,
          status: newStatus,
          sourceAsset: receipt.input_currency as string | undefined,
          destinationAsset: receipt.output_currency as string | undefined,
          sourceAmount: isValidAmount(receipt.initial_amount)
            ? receipt.initial_amount
            : undefined,
          destinationAmount: isValidAmount(receipt.outgoing_amount)
            ? receipt.outgoing_amount
            : undefined,
          metadata: object,
        })
        .onConflictDoNothing({ target: transactions.dakotaTxId })
        .returning({
          id: transactions.id,
          status: transactions.status,
          userId: transactions.userId,
          accountId: transactions.accountId,
          metadata: transactions.metadata,
        });

      if (inserted) {
        row = inserted;
        await logStatusChange({
          transactionId: row.id,
          oldStatus: null,
          newStatus,
        });
        // Row was born in newStatus; fall through so a birth directly into
        // "completed" still credits below.
      } else {
        // Concurrent insert won the race — re-read and treat as transition.
        [row] = await tx
          .select({
            id: transactions.id,
            status: transactions.status,
            userId: transactions.userId,
            accountId: transactions.accountId,
            metadata: transactions.metadata,
          })
          .from(transactions)
          .where(eq(transactions.dakotaTxId, dakotaTxId))
          .for("update");
      }
    }

    if (!row) return;

    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const alreadyCredited = meta.moneta_credited === true;
    const isNewRow = row.status === newStatus && !alreadyCredited;

    if (!isNewRow) {
      if (!isTransitionAllowed(row.status, newStatus)) return;
      await tx
        .update(transactions)
        .set({
          status: newStatus,
          metadata: { ...meta, ...object },
          destinationAmount: isValidAmount(receipt.outgoing_amount)
            ? (receipt.outgoing_amount as string)
            : undefined,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, row.id));
      await logStatusChange({
        transactionId: row.id,
        oldStatus: row.status,
        newStatus,
        reason: (object.return_reason ?? object.failure_reason) as string | undefined,
      });
    }

    // Credit exactly once: only deposits, only on entering completed, only
    // if this row has never been credited — all inside this row-locked tx.
    if (
      txType === "deposit" &&
      newStatus === "completed" &&
      !alreadyCredited &&
      isValidAmount(receipt.outgoing_amount)
    ) {
      let creditAccountId = row.accountId;
      if (!creditAccountId) {
        const [primary] = await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, row.userId),
              eq(accounts.isPrimary, true),
              ne(accounts.status, "closed")
            )
          )
          .limit(1);
        creditAccountId = primary?.id ?? null;
        if (!creditAccountId) {
          throw new Error(
            `deposit ${dakotaTxId}: no open primary account for user ${row.userId}`
          );
        }
        await tx
          .update(transactions)
          .set({ accountId: creditAccountId })
          .where(eq(transactions.id, row.id));
        row.accountId = creditAccountId;
      }

      const amount = receipt.outgoing_amount as string;
      await tx
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${amount}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, creditAccountId));
      await tx
        .update(transactions)
        .set({
          metadata: {
            ...meta,
            ...object,
            moneta_credited: true,
            moneta_credited_amount: amount,
          },
        })
        .where(eq(transactions.id, row.id));

      await createNotification({
        userId: row.userId,
        type: "transaction_update",
        title: "Deposit completed",
        body: `$${amount} has been added to your account.`,
        actionUrl: `/transactions/${row.id}`,
      });
    }

    // Clawback exactly once: ACH return/reversal after we credited.
    if (CLAWBACK_STATUSES.has(newStatus) && alreadyCredited && row.accountId) {
      const amount = (meta.moneta_credited_amount ??
        receipt.outgoing_amount) as string;
      if (isValidAmount(amount)) {
        await tx
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} - ${amount}::numeric`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, row.accountId));
        await tx
          .update(transactions)
          .set({ metadata: { ...meta, ...object, moneta_credited: false } })
          .where(eq(transactions.id, row.id));

        await createNotification({
          userId: row.userId,
          type: "transaction_update",
          title: "Deposit returned",
          body: `A $${amount} deposit was returned by the sending bank (${
            (object.return_code as string) ?? "no code"
          }) and has been removed from your balance.`,
          actionUrl: `/transactions/${row.id}`,
        });
      }
    }
  });

  await logAudit({
    actorType: "system",
    action: "dakota_auto_transaction",
    resourceType: "transaction",
    resourceId: dakotaTxId,
    metadata: { status: newStatus, type: dakotaType },
  });
}

// ─── One-off transfers (withdrawals) ────────────────────────────────────────

async function onOneOffTransaction(object: EventObject) {
  const dakotaTxId = object.id as string | undefined;
  const newStatus = object.status as string | undefined;
  if (!dakotaTxId || !newStatus) return;

  const [row] = await db
    .select({
      id: transactions.id,
      status: transactions.status,
      userId: transactions.userId,
    })
    .from(transactions)
    .where(eq(transactions.dakotaTxId, dakotaTxId))
    .limit(1);

  if (!row) {
    // One-off we didn't create (e.g. via Dakota dashboard) — record it if we
    // can attribute it, otherwise skip.
    const customerId = object.customer_id as string | undefined;
    if (!customerId) return;
    const [customer] = await db
      .select({ userId: dakotaCustomers.userId })
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.dakotaCustomerId, customerId))
      .limit(1);
    if (!customer) return;

    await db
      .insert(transactions)
      .values({
        userId: customer.userId,
        dakotaTxId,
        txType: "withdrawal",
        status: newStatus,
        sourceAsset: object.source_asset as string | undefined,
        destinationAsset: object.destination_asset as string | undefined,
        sourceAmount: isValidAmount(object.send_amount) ? object.send_amount : undefined,
        destinationAmount: isValidAmount(object.amount) ? object.amount : undefined,
        destinationId: object.destination_id as string | undefined,
        metadata: object,
      })
      .onConflictDoNothing({ target: transactions.dakotaTxId });
    return;
  }

  // Statuses after which the payout will definitively not (or no longer)
  // reach the recipient — the hold placed at initiation must be released.
  const REFUND_STATUSES = new Set([
    "failed",
    "cancelled",
    "canceled",
    "returned",
    "reversed",
    "rejected",
    "invalid",
    "timed_out",
  ]);

  let refundedAmount: string | null = null;
  let applied = false;

  await db.transaction(async (tx) => {
    const [locked] = await tx
      .select({
        id: transactions.id,
        status: transactions.status,
        accountId: transactions.accountId,
        metadata: transactions.metadata,
      })
      .from(transactions)
      .where(eq(transactions.id, row.id))
      .for("update");
    if (!locked || !isTransitionAllowed(locked.status, newStatus)) return;
    applied = true;

    const meta = (locked.metadata ?? {}) as Record<string, unknown>;
    // Spread order preserves our moneta_* bookkeeping flags: the incoming
    // Dakota object never contains them, so they survive the merge.
    let nextMeta: Record<string, unknown> = { ...meta, ...object };

    // Refund exactly once: only if this row still holds a debit.
    if (
      REFUND_STATUSES.has(newStatus) &&
      meta.moneta_debited === true &&
      locked.accountId &&
      isValidAmount(meta.moneta_debited_amount)
    ) {
      refundedAmount = meta.moneta_debited_amount as string;
      await tx
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${refundedAmount}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, locked.accountId));
      nextMeta = { ...nextMeta, moneta_debited: false };
    }

    await tx
      .update(transactions)
      .set({ status: newStatus, metadata: nextMeta, updatedAt: new Date() })
      .where(eq(transactions.id, locked.id));

    await logStatusChange({
      transactionId: locked.id,
      oldStatus: locked.status,
      newStatus,
      reason: (object.return_reason ?? object.failure_reason) as string | undefined,
    });
  });

  if (!applied) return;

  await createNotification({
    userId: row.userId,
    type: "transaction_update",
    title: `Transfer ${newStatus.replace(/_/g, " ")}`,
    body:
      newStatus === "completed"
        ? "Your transfer has been delivered."
        : refundedAmount
          ? `Your transfer did not complete — ${refundedAmount} has been returned to your account.`
          : `Your transfer status changed from ${row.status} to ${newStatus}.`,
    actionUrl: `/transactions/${row.id}`,
  });
}

// ─── Wallet transactions (on-chain legs) ────────────────────────────────────

async function onWalletTransaction(object: EventObject) {
  const dakotaTxId = object.id as string | undefined;
  const newStatus = object.status as string | undefined;
  if (!dakotaTxId || !newStatus) return;

  const [row] = await db
    .select({ id: transactions.id, status: transactions.status })
    .from(transactions)
    .where(eq(transactions.dakotaTxId, dakotaTxId))
    .limit(1);
  // Wallet sends we initiate get their ledger rows at creation time (phase 3);
  // anything else (unknown on-chain movement) is reconciliation territory.
  if (!row) return;

  if (!isTransitionAllowed(row.status, newStatus)) return;

  await db
    .update(transactions)
    .set({
      status: newStatus,
      transactionHash: object.transaction_hash as string | undefined,
      metadata: object,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, row.id));

  await logStatusChange({
    transactionId: row.id,
    oldStatus: row.status,
    newStatus,
  });
}

// ─── Wallet deposits (funds arrived at a wallet address) ────────────────────

async function onWalletDeposit(object: EventObject, envelope: DakotaEventEnvelope) {
  // Onramp deposits are credited via transaction.auto.* — this event is our
  // reconciliation signal plus coverage for direct on-chain receipts.
  const walletId = object.wallet_id as string | undefined;
  if (!walletId) return;

  const [wallet] = await db
    .select({ userId: wallets.userId })
    .from(wallets)
    .where(eq(wallets.dakotaWalletId, walletId))
    .limit(1);
  if (!wallet) return;

  await logAudit({
    actorType: "system",
    action: "wallet_deposit_received",
    resourceType: "wallet",
    resourceId: walletId,
    metadata: { event_id: envelope.id, object },
  });
}

// ─── Auto accounts (rails) ──────────────────────────────────────────────────

async function onAutoAccount(object: EventObject) {
  const dakotaAccountId = object.id as string | undefined;
  if (!dakotaAccountId) return;

  // Keep the cached virtual bank details in sync (they can arrive/refresh
  // after the account create response).
  const bankAccount = object.bank_account;
  if (!bankAccount) return;

  await db
    .update(dakotaRails)
    .set({ bankAccountInfo: bankAccount })
    .where(eq(dakotaRails.dakotaAccountId, dakotaAccountId));
}
