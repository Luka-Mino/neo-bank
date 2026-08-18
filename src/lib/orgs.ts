import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type { DbTx } from "@/lib/db/with-org";
import { organizations, orgMembers } from "@/lib/db/schema";

// Org roles, ranked. `canApprove` is a SEPARATE capability (maker/checker), not
// a rank — a member can be an approver; an admin who makes a payment still can't
// self-approve. See ORG-FOUNDATION-SPEC.md.
export type Role = "viewer" | "member" | "admin" | "owner";
export const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

/** True if `have` meets or exceeds the `need` rank. */
export function roleSatisfies(have: Role | undefined, need: Role): boolean {
  if (!have) return false;
  return ROLE_RANK[have] >= ROLE_RANK[need];
}

export interface Membership {
  orgId: string;
  role: Role;
  canApprove: boolean;
}

/**
 * Resolve a user's active membership SERVER-SIDE (never trusting client input).
 * Prefers the user's `active_org_id` (verified against a live active membership),
 * and falls back to their personal org. Returns null if the user belongs to no
 * active org — callers must fail closed.
 */
export async function resolveActiveMembership(
  userId: string,
  activeOrgId: string | null | undefined
): Promise<Membership | null> {
  if (activeOrgId) {
    const [m] = await db
      .select({
        orgId: orgMembers.orgId,
        role: orgMembers.role,
        canApprove: orgMembers.canApprove,
      })
      .from(orgMembers)
      .where(
        and(
          eq(orgMembers.userId, userId),
          eq(orgMembers.orgId, activeOrgId),
          eq(orgMembers.status, "active")
        )
      )
      .limit(1);
    if (m) return { orgId: m.orgId, role: m.role as Role, canApprove: m.canApprove };
  }

  // Fallback: the user's personal org (deterministic — one per user).
  const [pm] = await db
    .select({
      orgId: orgMembers.orgId,
      role: orgMembers.role,
      canApprove: orgMembers.canApprove,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(
      and(
        eq(orgMembers.userId, userId),
        eq(organizations.personalForUserId, userId),
        eq(orgMembers.status, "active")
      )
    )
    .limit(1);
  return pm ? { orgId: pm.orgId, role: pm.role as Role, canApprove: pm.canApprove } : null;
}

/**
 * Create a personal org for a new user + their owner membership, inside the
 * caller's transaction (so user + org are created atomically). Returns the org id.
 */
export async function createPersonalOrg(
  tx: DbTx,
  userId: string,
  fullName: string
): Promise<string> {
  const [org] = await tx
    .insert(organizations)
    .values({
      name: `${fullName || "Personal"} (Personal)`,
      type: "personal",
      status: "active",
      createdBy: userId,
      personalForUserId: userId,
    })
    .returning({ id: organizations.id });
  await tx.insert(orgMembers).values({
    orgId: org.id,
    userId,
    role: "owner",
    canApprove: true,
    status: "active",
  });
  return org.id;
}
