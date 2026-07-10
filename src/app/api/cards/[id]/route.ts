// PATCH /api/cards/[id] → rename or freeze/unfreeze.

import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { updateCardSchema } from "@/lib/validators/card";
import { assertCardOwnership, ownershipErr } from "@/lib/auth/ownership";

export const GET = apiHandler({
  handler: async ({ user, params }) => {
    try {
      const row = await assertCardOwnership(params.id, user.id);
      return ok(row);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }
  },
});

export const PATCH = apiHandler({
  schema: updateCardSchema,
  handler: async ({ user, params, body }) => {
    let current;
    try {
      current = await assertCardOwnership(params.id, user.id);
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
      .where(eq(cards.id, current.id))
      .returning();
    return ok(row);
  },
});
