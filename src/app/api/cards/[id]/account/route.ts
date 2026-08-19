// PATCH /api/cards/[id]/account → reassign a card to another of the org's
// accounts. Verifies org ownership of both card and target account.

import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { cards } from "@/lib/db/schema";
import { reassignCardSchema } from "@/lib/validators/card";
import {
  assertAccountOwnership,
  assertCardOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const PATCH = apiHandler({
  orgScoped: true,
  schema: reassignCardSchema,
  handler: async ({ user, params, body, db }) => {
    let card;
    try {
      card = await assertCardOwnership(db, params.id, user.orgId!);
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
      target = await assertAccountOwnership(db, body.accountId, user.orgId!);
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
      .where(and(eq(cards.id, card.id), eq(cards.orgId, user.orgId!)))
      .returning();

    return ok(row);
  },
});
