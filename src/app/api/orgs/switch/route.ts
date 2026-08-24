// POST /api/orgs/switch { orgId } — set the caller's active org after a
// server-side membership check. The jwt callback reads active_org_id live, so
// the switch takes effect on the next request (no token-version bump → the
// current session stays valid).
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { orgMembers, users } from "@/lib/db/schema";

const schema = z.object({ orgId: z.string().uuid() });

export const POST = apiHandler({
  schema,
  handler: async ({ user, body }) => {
    const [m] = await db
      .select({ id: orgMembers.id })
      .from(orgMembers)
      .where(
        and(
          eq(orgMembers.userId, user.id),
          eq(orgMembers.orgId, body.orgId),
          eq(orgMembers.status, "active")
        )
      )
      .limit(1);
    if (!m) return err("You are not a member of that organization", 403);

    await db
      .update(users)
      .set({ activeOrgId: body.orgId, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    return ok({ orgId: body.orgId });
  },
});
