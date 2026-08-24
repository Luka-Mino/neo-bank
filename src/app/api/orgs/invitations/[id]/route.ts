// DELETE /api/orgs/invitations/[id] — revoke a pending invite.
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { orgInvitations } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

export const DELETE = apiHandler({
  orgScoped: true,
  requiredRole: "admin",
  handler: async ({ user, params, db }) => {
    const { id } = params as { id: string };
    const [revoked] = await db
      .update(orgInvitations)
      .set({ status: "revoked" })
      .where(
        and(
          eq(orgInvitations.id, id),
          eq(orgInvitations.orgId, user.orgId!),
          eq(orgInvitations.status, "pending")
        )
      )
      .returning({ id: orgInvitations.id });
    if (!revoked) return err("Invitation not found", 404);

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: "invitation_revoked",
      resourceType: "org_invitation",
      resourceId: id,
    });
    return ok({ revoked: true });
  },
});
