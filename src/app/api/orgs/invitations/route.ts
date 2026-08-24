// GET  /api/orgs/invitations — pending invites for the active org.
// POST /api/orgs/invitations — invite by email (admin+, role <= inviter).
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { orgInvitations, orgMembers, users } from "@/lib/db/schema";
import {
  ROLE_RANK,
  generateInviteToken,
  hashInviteToken,
} from "@/lib/orgs";
import { logAudit } from "@/lib/audit";

export const GET = apiHandler({
  orgScoped: true,
  requiredRole: "admin",
  handler: async ({ user, db }) => {
    const rows = await db
      .select({
        id: orgInvitations.id,
        email: orgInvitations.email,
        role: orgInvitations.role,
        canApprove: orgInvitations.canApprove,
        canMoveMoney: orgInvitations.canMoveMoney,
        canExport: orgInvitations.canExport,
        status: orgInvitations.status,
        expiresAt: orgInvitations.expiresAt,
        createdAt: orgInvitations.createdAt,
      })
      .from(orgInvitations)
      .where(
        and(
          eq(orgInvitations.orgId, user.orgId!),
          eq(orgInvitations.status, "pending")
        )
      );
    return ok({ data: rows });
  },
});

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"), // owners aren't invited
  canApprove: z.boolean().default(false),
  // Default to NO powers — money/export authority must be granted deliberately,
  // and (enforced below) only by an inviter who holds the same power themselves.
  canMoveMoney: z.boolean().default(false),
  canExport: z.boolean().default(false),
});

export const POST = apiHandler({
  orgScoped: true,
  requiredRole: "admin",
  schema,
  handler: async ({ user, body, db }) => {
    // role <= inviter's role
    if (ROLE_RANK[body.role] >= ROLE_RANK[user.role!]) {
      return err("You can't invite someone at or above your own role", 403);
    }

    // Capabilities are clamped to the inviter's OWN — you can never hand out a
    // power you don't hold. Without this, an admin with approve=off could mint a
    // member with approve=on, manufacturing a second signer to defeat the
    // maker/checker control.
    if (body.canApprove && !user.canApprove) {
      return err("You can't grant approval rights you don't have yourself", 403);
    }
    if (body.canMoveMoney && !user.canMoveMoney) {
      return err("You can't grant money-movement rights you don't have yourself", 403);
    }
    if (body.canExport && !user.canExport) {
      return err("You can't grant export rights you don't have yourself", 403);
    }

    const email = body.email.toLowerCase();

    // Already an active member?
    const member = await db
      .select({ id: orgMembers.id })
      .from(orgMembers)
      .innerJoin(users, eq(users.id, orgMembers.userId))
      .where(
        and(
          eq(orgMembers.orgId, user.orgId!),
          eq(users.email, email),
          eq(orgMembers.status, "active")
        )
      )
      .limit(1);
    if (member.length) return err("That person is already a member", 409);

    // Existing pending invite? (partial unique index backstops this.)
    const pending = await db
      .select({ id: orgInvitations.id })
      .from(orgInvitations)
      .where(
        and(
          eq(orgInvitations.orgId, user.orgId!),
          eq(orgInvitations.email, email),
          eq(orgInvitations.status, "pending")
        )
      )
      .limit(1);
    if (pending.length) return err("There's already a pending invite for that email", 409);

    const token = generateInviteToken();
    const [inv] = await db
      .insert(orgInvitations)
      .values({
        orgId: user.orgId!,
        email,
        role: body.role,
        canApprove: body.canApprove,
        canMoveMoney: body.canMoveMoney,
        canExport: body.canExport,
        tokenHash: hashInviteToken(token),
        invitedBy: user.id,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning({ id: orgInvitations.id });

    await logAudit({
      orgId: user.orgId,
      actorType: "user",
      actorId: user.id,
      action: "member_invited",
      resourceType: "org_invitation",
      resourceId: inv.id,
      metadata: { email, role: body.role },
    });

    // Email delivery is dark until a provider is wired; return the raw token so
    // the admin can share the accept link. (The creator is already authorized.)
    return ok({ id: inv.id, email, role: body.role, inviteToken: token }, 201);
  },
});
