// GET  /api/cards   → list the org's cards (newest first)
// POST /api/cards   → issue a new card on one of the org's accounts.
//                     Mocked: generates last4 and exp, no real issuer call.

import { desc, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { cards } from "@/lib/db/schema";
import { createCardSchema } from "@/lib/validators/card";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";
import { defaultCardNickname } from "@/lib/cards";
import { getIssuerProvider } from "@/lib/card-issuer";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const rows = await db
      .select()
      .from(cards)
      .where(eq(cards.orgId, user.orgId!))
      .orderBy(desc(cards.createdAt));
    return ok({ data: rows });
  },
});

export const POST = apiHandler({
  orgScoped: true,
  schema: createCardSchema,
  handler: async ({ user, body, db }) => {
    // Caller must own the target account (in this org) before we issue against it.
    let target;
    try {
      target = await assertAccountOwnership(db, body.accountId, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (target.status !== "active") {
      return err("Cannot issue a card on a non-active account", 409);
    }

    // Issue through the swappable provider (mock today; Stripe Issuing once
    // we incorporate). See CARD-ISSUING-PLAN.md.
    const issued = await getIssuerProvider().issueCard({
      userId: user.id,
      accountId: body.accountId,
      cardType: body.cardType,
      cardholder: { name: user.name ?? "", email: user.email ?? "" },
    });

    const [row] = await db
      .insert(cards)
      .values({
        orgId: user.orgId!,
        userId: user.id, // cardholder/actor
        accountId: body.accountId,
        cardType: body.cardType,
        last4: issued.last4,
        nickname: body.nickname ?? defaultCardNickname(body.cardType),
        expMonth: issued.expMonth,
        expYear: issued.expYear,
        network: issued.network,
        panToken: issued.panToken,
        externalCardId: issued.externalCardId,
      })
      .returning();

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "card_issued",
      resourceType: "card",
      resourceId: row.id,
      metadata: { accountId: row.accountId, last4: row.last4 },
    });
    return ok(row, 201);
  },
});
