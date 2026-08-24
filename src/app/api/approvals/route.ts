// GET /api/approvals[?status=pending] — the org's approval requests.
import { and, desc, eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { approvalRequests } from "@/lib/db/schema";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, request, db }) => {
    const status = request.nextUrl.searchParams.get("status");
    const where = status
      ? and(
          eq(approvalRequests.orgId, user.orgId!),
          eq(approvalRequests.status, status)
        )
      : eq(approvalRequests.orgId, user.orgId!);
    const rows = await db
      .select()
      .from(approvalRequests)
      .where(where)
      .orderBy(desc(approvalRequests.createdAt))
      .limit(100);
    return ok({ data: rows });
  },
});
