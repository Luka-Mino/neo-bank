import { createHmac } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import {
  approvalPolicies,
  approvalRequests,
  approvalDecisions,
} from "@/lib/db/schema";
import type { DbTx } from "@/lib/db/with-org";

// Maker/checker approval engine (see TEAM-RBAC-PLAN.md). Policies define, per
// action + asset, threshold BANDS ("over $X needs N approvals"); a triggered
// payment becomes a pending approval_request instead of executing; approvers
// vote; on reaching the required count it flips to 'approved' and the execute
// endpoint replays the exact payload (re-verified against payload_hash).

export type ApprovalActionType =
  | "transfer.internal"
  | "transfer.external"
  | "recipient.destination.add"
  | "recipient.destination.change";

// Stable, key-sorted JSON so the payload hash is order-independent.
function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  const o = v as Record<string, unknown>;
  return (
    "{" +
    Object.keys(o)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + canonical(o[k]))
      .join(",") +
    "}"
  );
}

/** HMAC of the canonical payload — the TOCTOU guard, keyed off AUTH_SECRET. */
export function hashPayload(payload: unknown): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", `${secret}:approvals-v1`)
    .update(canonical(payload))
    .digest("hex");
}

/**
 * How many approvals this action needs (0 = none). Considers every ENABLED
 * policy band for (org, action, asset) and takes the MAX required_approvals of
 * the bands that trigger — a null threshold always triggers; a numeric one
 * triggers when amount >= threshold. So >$5k→1 and >$50k→2 both apply at $60k
 * and the stronger (2) wins.
 */
export async function resolveRequiredApprovals(
  dbc: DbTx,
  orgId: string,
  actionType: ApprovalActionType,
  amount: string | null,
  asset: string
): Promise<number> {
  const policies = await dbc
    .select({
      thresholdAmount: approvalPolicies.thresholdAmount,
      requiredApprovals: approvalPolicies.requiredApprovals,
    })
    .from(approvalPolicies)
    .where(
      and(
        eq(approvalPolicies.orgId, orgId),
        eq(approvalPolicies.actionType, actionType),
        eq(approvalPolicies.thresholdAsset, asset),
        eq(approvalPolicies.enabled, true)
      )
    );

  let required = 0;
  const amt = amount === null ? null : Number(amount);
  for (const p of policies) {
    const triggers =
      p.thresholdAmount === null ||
      (amt !== null && amt >= Number(p.thresholdAmount));
    if (triggers) required = Math.max(required, p.requiredApprovals);
  }
  return required;
}

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createApprovalRequest(
  dbc: DbTx,
  params: {
    orgId: string;
    actionType: ApprovalActionType;
    payload: Record<string, unknown>;
    amount: string | null;
    asset: string | null;
    requestedBy: string;
    requiredApprovals: number;
    ttlMs?: number;
  }
) {
  const [row] = await dbc
    .insert(approvalRequests)
    .values({
      orgId: params.orgId,
      actionType: params.actionType,
      payload: params.payload,
      payloadHash: hashPayload(params.payload),
      amount: params.amount,
      asset: params.asset,
      requiredApprovals: params.requiredApprovals,
      requestedBy: params.requestedBy,
      status: "pending",
      expiresAt: new Date(Date.now() + (params.ttlMs ?? DEFAULT_TTL_MS)),
    })
    .returning();
  return row;
}

export type DecisionResult = {
  ok: boolean;
  reason?: "already_decided" | "self_approval";
  status?: string;
  approvalsCount?: number;
};

/**
 * Record one approver's vote. Enforces maker≠checker (approver != requestedBy),
 * one vote per approver (UNIQUE(request_id, approver_id)), and recomputes the
 * distinct-approve tally. Flips the request to 'approved' at quorum, 'rejected'
 * on any reject. Caller must have already verified the approver is a live
 * can_approve member of the org. Runs inside the caller's tx.
 */
export async function recordDecision(
  dbc: DbTx,
  request: {
    id: string;
    requestedBy: string;
    requiredApprovals: number;
  },
  approverId: string,
  decision: "approve" | "reject",
  comment?: string
): Promise<DecisionResult> {
  if (request.requestedBy === approverId) {
    return { ok: false, reason: "self_approval" };
  }

  // Insert the vote; the unique index makes a second vote a no-op.
  const inserted = await dbc
    .insert(approvalDecisions)
    .values({ requestId: request.id, approverId, decision, comment })
    .onConflictDoNothing({
      target: [approvalDecisions.requestId, approvalDecisions.approverId],
    })
    .returning({ id: approvalDecisions.id });
  if (inserted.length === 0) return { ok: false, reason: "already_decided" };

  if (decision === "reject") {
    await dbc
      .update(approvalRequests)
      .set({ status: "rejected", decidedAt: new Date(), updatedAt: new Date() })
      .where(eq(approvalRequests.id, request.id));
    return { ok: true, status: "rejected", approvalsCount: 0 };
  }

  const [{ count }] = await dbc
    .select({ count: sql<number>`count(*)::int` })
    .from(approvalDecisions)
    .where(
      and(
        eq(approvalDecisions.requestId, request.id),
        eq(approvalDecisions.decision, "approve")
      )
    );
  const approvalsCount = Number(count);
  const status = approvalsCount >= request.requiredApprovals ? "approved" : "pending";
  await dbc
    .update(approvalRequests)
    .set({
      approvalsCount,
      status,
      decidedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, request.id));
  return { ok: true, status, approvalsCount };
}
