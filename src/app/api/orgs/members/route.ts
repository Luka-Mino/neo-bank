// GET /api/orgs/members — roster of the active org.
import { eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { orgMembers, users } from "@/lib/db/schema";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const rows = await db
      .select({
        id: orgMembers.id,
        userId: orgMembers.userId,
        name: users.fullName,
        email: users.email,
        role: orgMembers.role,
        canApprove: orgMembers.canApprove,
        canMoveMoney: orgMembers.canMoveMoney,
        canExport: orgMembers.canExport,
        status: orgMembers.status,
        createdAt: orgMembers.createdAt,
      })
      .from(orgMembers)
      .innerJoin(users, eq(users.id, orgMembers.userId))
      .where(eq(orgMembers.orgId, user.orgId!));
    return ok({ data: rows });
  },
});
