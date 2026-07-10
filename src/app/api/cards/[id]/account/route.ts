// PATCH /api/cards/[id]/account → reassign a card to another of the
// caller's accounts. Verifies ownership of both card and target account.

import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { reassignCardSchema } from "@/lib/validators/card";
import {
  assertAccountOwnership,
  assertCardOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const PATCH = apiHandler({
  schema: reassignCardSchema,
  handler: async ({ user, params, body }) => {
    let card;
    try {
      card = await assertCardOwnership(params.id, user.id);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (card.status === "canceled" || card.status === "replaced") {
      return err(
        `Cannot reassign a ${card.status} card; issue a new one instead`,
        409
      );
    }

    let target;
    try {
      target = await assertAccountOwnership(body.accountId, user.id);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (target.status !== "active") {
      return err("Cannot move a card to a non-active account", 409);
    }

    if (card.accountId === target.id) {
      return ok(card);
    }

    const [row] = await db
      .update(cards)
      .set({ accountId: target.id, updatedAt: new Date() })
      .where(eq(cards.id, card.id))
      .returning();

    return ok(row);
  },
});
