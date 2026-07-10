// GET  /api/cards   → list the caller's cards (newest first)
// POST /api/cards   → issue a new card on one of the caller's accounts.
//                     Mocked: generates last4 and exp, no real issuer call.

import { desc, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { createCardSchema } from "@/lib/validators/card";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";
import {
  defaultCardNickname,
  defaultNetwork,
  generateLast4,
  nextExpiry,
} from "@/lib/cards";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const rows = await db
      .select()
      .from(cards)
      .where(eq(cards.userId, user.id))
      .orderBy(desc(cards.createdAt));
    return ok({ data: rows });
  },
});

export const POST = apiHandler({
  schema: createCardSchema,
  handler: async ({ user, body }) => {
    // Caller must own the target account before we issue against it.
    let target;
    try {
      target = await assertAccountOwnership(body.accountId, user.id);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (target.status !== "active") {
      return err("Cannot issue a card on a non-active account", 409);
    }

    const exp = nextExpiry();
    const [row] = await db
      .insert(cards)
      .values({
        userId: user.id,
        accountId: body.accountId,
        cardType: body.cardType,
        last4: generateLast4(),
        nickname: body.nickname ?? defaultCardNickname(body.cardType),
        expMonth: exp.month,
        expYear: exp.year,
        network: defaultNetwork(),
      })
      .returning();

    return ok(row, 201);
  },
});
