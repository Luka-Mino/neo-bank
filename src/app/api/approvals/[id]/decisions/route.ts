// POST /api/approvals/[id]/decisions — an approver votes approve/reject.
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { approvalRequests } from "@/lib/db/schema";
import { recordDecision } from "@/lib/approvals";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  comment: z.string().trim().max(500).optional(),
});

export const POST = apiHandler({
  orgScoped: true,
  requireApprover: true, // must have can_approve
  schema,
  handler: async ({ user, params, body, db }) => {
    const { id } = params as { id: string };
    const [req] = await db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, id),
          eq(approvalRequests.orgId, user.orgId!)
        )
      )
      .limit(1);
    if (!req) return err("Approval request not found", 404);
    if (req.status !== "pending") {
      return err(`This request is already ${req.status}`, 409);
    }
    if (req.expiresAt && req.expiresAt.getTime() < Date.now()) {
      await db
        .update(approvalRequests)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(approvalRequests.id, id));
      return err("This approval request has expired", 409);
    }

    const result = await recordDecision(db, req, user.id, body.decision, body.comment);
    if (!result.ok) {
      if (result.reason === "self_approval") {
        return err("You cannot approve your own request", 403);
      }
      return err("You have already decided on this request", 409);
    }

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: `approval_${body.decision}`,
      resourceType: "approval_request",
      resourceId: id,
      metadata: { status: result.status, approvalsCount: result.approvalsCount },
    });
    return ok({ status: result.status, approvalsCount: result.approvalsCount });
  },
});
