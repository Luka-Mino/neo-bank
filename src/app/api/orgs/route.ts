// GET  /api/orgs  → orgs the caller is an active member of (with their role).
// POST /api/orgs  → create a business org (creator becomes owner).
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { organizations, orgMembers } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const rows = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        status: organizations.status,
        role: orgMembers.role,
        canApprove: orgMembers.canApprove,
        canMoveMoney: orgMembers.canMoveMoney,
        canExport: orgMembers.canExport,
      })
      .from(orgMembers)
      .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
      .where(and(eq(orgMembers.userId, user.id), eq(orgMembers.status, "active")));
    return ok({ data: rows });
  },
});

const createSchema = z.object({ name: z.string().trim().min(1).max(80) });

export const POST = apiHandler({
  schema: createSchema,
  rateLimit: { limit: 10, window: "1h" },
  handler: async ({ user, body }) => {
    const orgId = await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({ name: body.name, type: "business", status: "active", createdBy: user.id })
        .returning({ id: organizations.id });
      await tx.insert(orgMembers).values({
        orgId: org.id,
        userId: user.id,
        role: "owner",
        canApprove: true,
        canMoveMoney: true,
        canExport: true,
        status: "active",
      });
      return org.id;
    });
    await logAudit({
      orgId,
      actorType: "user",
      actorId: user.id,
      action: "org_created",
      resourceType: "organization",
      resourceId: orgId,
      metadata: { name: body.name },
    });
    return ok({ id: orgId, name: body.name }, 201);
  },
});
