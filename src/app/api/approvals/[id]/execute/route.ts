// POST /api/approvals/[id]/execute — run an approved request's action.
// Idempotent (executed_tx_id set once), integrity-checked (payload_hash
// re-verified), and re-authorized (both legs re-checked against the org at
// execute time — state can change between request and execution).
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { approvalRequests } from "@/lib/db/schema";
import { hashPayload } from "@/lib/approvals";
import { performInternalTransfer, INSUFFICIENT_FUNDS } from "@/lib/transfers";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";
import { logAudit } from "@/lib/audit";

export const POST = apiHandler({
  orgScoped: true,
  requireMoveMoney: true,
  handler: async ({ user, params, db }) => {
    const { id } = params as { id: string };

    // Claim the request under a row lock (whole handler is one tx via withOrg).
    const [req] = await db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, id),
          eq(approvalRequests.orgId, user.orgId!)
        )
      )
      .for("update")
      .limit(1);

    if (!req) return err("Approval request not found", 404);
    if (req.executedTxId) {
      return ok({ status: "executed", alreadyExecuted: true });
    }
    if (req.status !== "approved") {
      return err(`This request is ${req.status}, not approved`, 409);
    }
    // TOCTOU guard: the stored payload must still hash to what was approved.
    if (hashPayload(req.payload) !== req.payloadHash) {
      return err("Approval payload failed its integrity check", 409);
    }

    const p = (req.payload ?? {}) as Record<string, unknown>;

    if (req.actionType === "transfer.internal") {
      const fromAccountId = p.fromAccountId as string;
      const toAccountId = p.toAccountId as string;
      // Re-authorize both legs against the org NOW (they could have moved/closed).
      let from, to;
      try {
        [from, to] = await Promise.all([
          assertAccountOwnership(db, fromAccountId, user.orgId!),
          assertAccountOwnership(db, toAccountId, user.orgId!),
        ]);
      } catch (e) {
        const o = ownershipErr(e);
        if (o) return err(o.message, o.status);
        throw e;
      }
      if (from.status !== "active" || to.status !== "active") {
        return err("An account in this transfer is no longer active", 409);
      }

      try {
        const result = await performInternalTransfer(
          {
            orgId: user.orgId!,
            userId: req.requestedBy, // the maker who initiated
            fromAccountId,
            toAccountId,
            amount: p.amount as string,
            note: (p.note as string | null) ?? null,
            currency: p.currency as string,
          },
          db
        );
        await db
          .update(approvalRequests)
          .set({
            status: "executed",
            executedTxId: result.debit.id,
            executedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(approvalRequests.id, id));

        await logAudit({
          orgId: user.orgId,
          actorType: "user",
          actorId: user.id,
          action: "approval_executed",
          resourceType: "approval_request",
          resourceId: id,
          metadata: { actionType: req.actionType, pairId: result.pairId },
        });
        return ok({ status: "executed", result }, 201);
      } catch (e) {
        if (e instanceof Error && e.message === INSUFFICIENT_FUNDS) {
          return err("Insufficient balance to execute this transfer", 402);
        }
        throw e;
      }
    }

    return err(`Execution is not supported for ${req.actionType} yet`, 400);
  },
});
