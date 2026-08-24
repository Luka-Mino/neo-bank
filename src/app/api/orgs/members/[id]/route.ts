// PATCH  /api/orgs/members/[id] — change a member's role/capabilities.
// DELETE /api/orgs/members/[id] — offboard a member.
//
// Invariants enforced in-route (not the schema): (a) can't grant a role >= your
// own; (b) can't edit/remove yourself; (c) can't touch a member at/above your
// rank; (d) an org must keep >=1 active owner.
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { orgMembers, users, approvalRequests } from "@/lib/db/schema";
import { ROLE_RANK, countActiveOwners, type Role } from "@/lib/orgs";
import { logAudit } from "@/lib/audit";

const patchSchema = z
  .object({
    role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
    canApprove: z.boolean().optional(),
    canMoveMoney: z.boolean().optional(),
    canExport: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field required");

export const PATCH = apiHandler({
  orgScoped: true,
  requiredRole: "admin",
  schema: patchSchema,
  handler: async ({ user, params, body, db }) => {
    const { id } = params as { id: string };
    const [target] = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.id, id), eq(orgMembers.orgId, user.orgId!)))
      .limit(1);
    if (!target) return err("Member not found", 404);

    const actorRank = ROLE_RANK[user.role!];
    if (target.userId === user.id) {
      return err("You can't edit your own membership", 403);
    }
    if (ROLE_RANK[target.role as Role] >= actorRank) {
      return err("You can't modify a member at or above your own role", 403);
    }
    if (body.role && ROLE_RANK[body.role] >= actorRank) {
      return err("You can't assign a role at or above your own", 403);
    }
    // ≥1 owner: block demoting the last owner (can't happen here since a lower-
    // rank actor can't touch an owner, but guard anyway for owner-actors).
    if (
      target.role === "owner" &&
      body.role &&
      body.role !== "owner" &&
      (await countActiveOwners(db, user.orgId!)) <= 1
    ) {
      return err("An organization must keep at least one owner", 409);
    }

    const patch: Partial<typeof orgMembers.$inferInsert> = { updatedAt: new Date() };
    if (body.role !== undefined) patch.role = body.role;
    if (body.canApprove !== undefined) patch.canApprove = body.canApprove;
    if (body.canMoveMoney !== undefined) patch.canMoveMoney = body.canMoveMoney;
    if (body.canExport !== undefined) patch.canExport = body.canExport;

    const [updated] = await db
      .update(orgMembers)
      .set(patch)
      .where(and(eq(orgMembers.id, id), eq(orgMembers.orgId, user.orgId!)))
      .returning();
    // No token_version bump needed — the jwt callback re-derives role +
    // capabilities live each request, so the change is effective immediately.

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: "member_updated",
      resourceType: "org_member",
      resourceId: id,
      metadata: { targetUserId: target.userId, ...body },
    });
    return ok(updated);
  },
});

export const DELETE = apiHandler({
  orgScoped: true,
  requiredRole: "admin",
  handler: async ({ user, params, db }) => {
    const { id } = params as { id: string };
    const [target] = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.id, id), eq(orgMembers.orgId, user.orgId!)))
      .limit(1);
    if (!target) return err("Member not found", 404);

    if (target.userId === user.id) {
      return err("You can't remove yourself; transfer ownership first", 403);
    }
    if (ROLE_RANK[target.role as Role] >= ROLE_RANK[user.role!]) {
      return err("You can't remove a member at or above your own role", 403);
    }
    if (target.role === "owner" && (await countActiveOwners(db, user.orgId!)) <= 1) {
      return err("An organization must keep at least one owner", 409);
    }

    await db
      .update(orgMembers)
      .set({ status: "removed", updatedAt: new Date() })
      .where(eq(orgMembers.id, id));

    // Don't wedge the org: cancel the removed member's own pending approval
    // requests (a removed maker's request can never proceed).
    await db
      .update(approvalRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(approvalRequests.orgId, user.orgId!),
          eq(approvalRequests.requestedBy, target.userId),
          eq(approvalRequests.status, "pending")
        )
      );

    // Kill the removed member's live sessions and clear their pointer to this
    // org (they fall back to their personal org on next sign-in).
    await db
      .update(users)
      .set({
        tokenVersion: sql`${users.tokenVersion} + 1`,
        activeOrgId: sql`CASE WHEN ${users.activeOrgId} = ${user.orgId!} THEN NULL ELSE ${users.activeOrgId} END`,
      })
      .where(eq(users.id, target.userId));

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: "member_removed",
      resourceType: "org_member",
      resourceId: id,
      metadata: { targetUserId: target.userId, role: target.role },
    });
    return ok({ removed: true });
  },
});
