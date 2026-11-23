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
import { CardIssuerNotReadyError, getIssuerProvider } from "@/lib/card-issuer";

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

    // Issue through the swappable provider (mock by default; Dakota Cards when
    // ISSUING_PROVIDER=dakota). See CARD-ISSUING-PLAN.md.
    const nickname = body.nickname ?? defaultCardNickname(body.cardType);
    let issued;
    try {
      issued = await getIssuerProvider().issueCard({
        userId: user.id,
        accountId: body.accountId,
        cardType: body.cardType,
        nickname,
        cardholder: { name: user.name ?? "", email: user.email ?? "" },
      });
    } catch (e) {
      // A prerequisite isn't met yet (terms, cardholder review, wallet
      // enablement). The message is written to be shown to the user.
      if (e instanceof CardIssuerNotReadyError) {
        return err(e.message, 409, { reason: e.reason });
      }
      throw e;
    }

    const [row] = await db
      .insert(cards)
      .values({
        orgId: user.orgId!,
        userId: user.id, // cardholder/actor
        accountId: body.accountId,
        cardType: body.cardType,
        last4: issued.last4,
        nickname,
        status: issued.status,
        expMonth: issued.expMonth,
        expYear: issued.expYear,
        network: issued.network,
        panToken: issued.panToken,
        externalCardId: issued.externalCardId,
        issuerVersion: issued.issuerVersion,
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
