// GET  /api/approval-policies — the org's approval policy bands.
// POST /api/approval-policies — owner-only upsert of a band.
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { approvalPolicies } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const rows = await db
      .select()
      .from(approvalPolicies)
      .where(eq(approvalPolicies.orgId, user.orgId!));
    return ok({ data: rows });
  },
});

const schema = z.object({
  actionType: z.enum([
    "transfer.internal",
    "transfer.external",
    "recipient.destination.add",
    "recipient.destination.change",
  ]),
  // null = "always require"; a number = "require when amount >= this".
  thresholdAmount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Must be a positive number")
    .nullable()
    .optional(),
  thresholdAsset: z.string().trim().min(1).max(10).default("USD"),
  requiredApprovals: z.number().int().min(1).max(10),
  enabled: z.boolean(),
});

export const POST = apiHandler({
  orgScoped: true,
  requiredRole: "owner", // policy is owner-editable only
  schema,
  handler: async ({ user, body, db }) => {
    const amount = body.thresholdAmount ?? null;
    // Null-safe upsert on (org, action, asset, amount) — one row per band.
    const updated = await db
      .update(approvalPolicies)
      .set({
        requiredApprovals: body.requiredApprovals,
        enabled: body.enabled,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(approvalPolicies.orgId, user.orgId!),
          eq(approvalPolicies.actionType, body.actionType),
          eq(approvalPolicies.thresholdAsset, body.thresholdAsset),
          sql`${approvalPolicies.thresholdAmount} IS NOT DISTINCT FROM ${amount}::numeric`
        )
      )
      .returning();

    let row = updated[0];
    if (!row) {
      [row] = await db
        .insert(approvalPolicies)
        .values({
          orgId: user.orgId!,
          actionType: body.actionType,
          thresholdAmount: amount,
          thresholdAsset: body.thresholdAsset,
          requiredApprovals: body.requiredApprovals,
          enabled: body.enabled,
        })
        .returning();
    }

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: "approval_policy_upsert",
      resourceType: "approval_policy",
      resourceId: row.id,
      metadata: {
        actionType: body.actionType,
        thresholdAmount: amount,
        requiredApprovals: body.requiredApprovals,
        enabled: body.enabled,
      },
    });
    return ok(row);
  },
});
