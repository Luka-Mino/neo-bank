// GET   /api/cards/[id] → fetch one of the org's cards.
// PATCH /api/cards/[id] → rename or freeze/unfreeze.

import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { cards } from "@/lib/db/schema";
import { updateCardSchema } from "@/lib/validators/card";
import { assertCardOwnership, ownershipErr } from "@/lib/auth/ownership";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, db }) => {
    try {
      const row = await assertCardOwnership(db, params.id, user.orgId!);
      return ok(row);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }
  },
});

export const PATCH = apiHandler({
  orgScoped: true,
  schema: updateCardSchema,
  handler: async ({ user, params, body, db }) => {
    let current;
    try {
      current = await assertCardOwnership(db, params.id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (current.status === "canceled" || current.status === "replaced") {
      return err(
        `Cannot modify a ${current.status} card; issue a new one instead`,
        409
      );
    }

    const patch: Partial<typeof cards.$inferInsert> = { updatedAt: new Date() };
    if (body.nickname !== undefined) patch.nickname = body.nickname;
    if (body.status !== undefined) patch.status = body.status;

    const [row] = await db
      .update(cards)
      .set(patch)
      .where(and(eq(cards.id, current.id), eq(cards.orgId, user.orgId!)))
      .returning();
    return ok(row);
  },
});
