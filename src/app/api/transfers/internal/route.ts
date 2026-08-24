// POST /api/transfers/internal
// Atomic book-transfer between two of the org's own accounts. No Dakota
// involvement — the org's underlying custodial wallet is untouched. Two
// transaction rows are written (debit on source, credit on destination)
// linked by metadata.internal_pair_id, both inside one DB transaction.

import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { internalTransferSchema } from "@/lib/validators/transfer";
import { INSUFFICIENT_FUNDS, performInternalTransfer } from "@/lib/transfers";
import { assertEmailVerified, assertMfaEnabled } from "@/lib/auth/verification";
import {
  resolveRequiredApprovals,
  createApprovalRequest,
} from "@/lib/approvals";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const POST = apiHandler({
  orgScoped: true,
  requireMoveMoney: true,
  schema: internalTransferSchema,
  rateLimit: { limit: 60, window: "1h" },
  handler: async ({ user, body, db }) => {
    // Ownership of BOTH legs (in this org) before doing anything.
    let from, to;
    try {
      [from, to] = await Promise.all([
        assertAccountOwnership(db, body.fromAccountId, user.orgId!),
        assertAccountOwnership(db, body.toAccountId, user.orgId!),
      ]);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    const unverified = await assertEmailVerified(user.id);
    if (unverified) return err(unverified.message, unverified.status);
    const noMfa = await assertMfaEnabled(user.id);
    if (noMfa) return err(noMfa.message, noMfa.status);

    if (from.status !== "active") {
      return err("Source account is not active", 409);
    }
    if (to.status !== "active") {
      return err("Destination account is not active", 409);
    }
    if (from.currency !== to.currency) {
      return err(
        "Cross-currency internal transfers aren't supported yet",
        409
      );
    }
    if (Number(from.balance) < Number(body.amount)) {
      return err("Insufficient balance", 402);
    }

    // Maker/checker: if a policy band is triggered, create a pending approval
    // request instead of executing. An approver decides; the execute endpoint
    // replays it. Below threshold (or no policy) → execute immediately.
    const required = await resolveRequiredApprovals(
      db,
      user.orgId!,
      "transfer.internal",
      body.amount,
      from.currency
    );
    if (required > 0) {
      const req = await createApprovalRequest(db, {
        orgId: user.orgId!,
        actionType: "transfer.internal",
        payload: {
          fromAccountId: from.id,
          toAccountId: to.id,
          amount: body.amount,
          note: body.note ?? null,
          currency: from.currency,
        },
        amount: body.amount,
        asset: from.currency,
        requestedBy: user.id,
        requiredApprovals: required,
      });
      await logAudit({
        orgId: user.orgId,
        actorType: "user",
        actorId: user.id,
        action: "approval_requested",
        resourceType: "approval_request",
        resourceId: req.id,
        metadata: { actionType: "transfer.internal", amount: body.amount, requiredApprovals: required },
      });
      return ok(
        { status: "pending_approval", approvalRequestId: req.id, requiredApprovals: required },
        202
      );
    }

    try {
      const result = await performInternalTransfer(
        {
          orgId: user.orgId!,
          userId: user.id,
          fromAccountId: from.id,
          toAccountId: to.id,
          amount: body.amount,
          note: body.note,
          currency: from.currency,
        },
        db
      );

      await logAudit({
        actorType: "user",
        actorId: user.id,
        action: "internal_transfer",
        resourceType: "account",
        resourceId: from.id,
        metadata: { toAccountId: to.id, amount: body.amount, pairId: result.pairId },
      });
      return ok(result, 201);
    } catch (e) {
      if (e instanceof Error && e.message === INSUFFICIENT_FUNDS) {
        return err("Insufficient balance", 402);
      }
      throw e;
    }
  },
});
