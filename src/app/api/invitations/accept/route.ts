// POST /api/invitations/accept { token } — the signed-in user accepts an org
// invite. Bound to the invited email, single-use, atomic. Not orgScoped — the
// user is joining a NEW org.
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { orgInvitations, orgMembers, users } from "@/lib/db/schema";
import { hashInviteToken } from "@/lib/orgs";
import { assertEmailVerified } from "@/lib/auth/verification";
import { logAudit } from "@/lib/audit";

const schema = z.object({ token: z.string().min(10) });

export const POST = apiHandler({
  schema,
  rateLimit: { limit: 10, window: "15m" },
  handler: async ({ user, body }) => {
    const tokenHash = hashInviteToken(body.token);
    const [inv] = await db
      .select()
      .from(orgInvitations)
      .where(
        and(
          eq(orgInvitations.tokenHash, tokenHash),
          eq(orgInvitations.status, "pending")
        )
      )
      .limit(1);
    if (!inv) return err("Invalid or already-used invitation", 404);
    if (inv.expiresAt.getTime() < Date.now()) {
      return err("This invitation has expired", 410);
    }

    // Bind to the invited email — the accepting user must own it.
    const [u] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    if (!u || u.email.toLowerCase() !== inv.email.toLowerCase()) {
      return err("This invitation was sent to a different email address", 403);
    }

    // The invite is bound to the invited email, but that binding is only as good
    // as our proof the accepter actually OWNS that address. Require a verified
    // email before joining someone else's org (inert until email delivery is
    // configured, exactly like the money-movement gate — so it can't lock anyone
    // out today but activates automatically the moment email is live).
    const unverified = await assertEmailVerified(user.id);
    if (unverified) {
      return err(
        "Verify your email before joining an organization. Check your inbox for the link.",
        unverified.status
      );
    }

    try {
      await db.transaction(async (tx) => {
        // Atomic single-use consume.
        const claimed = await tx
          .update(orgInvitations)
          .set({
            status: "accepted",
            acceptedAt: new Date(),
            acceptedByUserId: user.id,
          })
          .where(
            and(
              eq(orgInvitations.id, inv.id),
              eq(orgInvitations.status, "pending")
            )
          )
          .returning({ id: orgInvitations.id });
        if (claimed.length === 0) throw new Error("ALREADY_ACCEPTED");

        await tx
          .insert(orgMembers)
          .values({
            orgId: inv.orgId,
            userId: user.id,
            role: inv.role,
            canApprove: inv.canApprove,
            canMoveMoney: inv.canMoveMoney,
            canExport: inv.canExport,
            status: "active",
            invitedBy: inv.invitedBy,
          })
          .onConflictDoNothing({
            target: [orgMembers.orgId, orgMembers.userId],
          });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "ALREADY_ACCEPTED") {
        return err("This invitation was just used", 409);
      }
      throw e;
    }

    await logAudit({
      orgId: inv.orgId,
      actorType: "user",
      actorId: user.id,
      action: "invitation_accepted",
      resourceType: "org_invitation",
      resourceId: inv.id,
      metadata: { role: inv.role },
    });
    return ok({ orgId: inv.orgId, role: inv.role });
  },
});
