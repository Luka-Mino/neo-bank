// GET   /api/cards/[id] → fetch one of the org's cards.
// PATCH /api/cards/[id] → rename or freeze/unfreeze.

import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { cards } from "@/lib/db/schema";
import { updateCardSchema } from "@/lib/validators/card";
import { assertCardOwnership, ownershipErr } from "@/lib/auth/ownership";
import { getIssuerProvider } from "@/lib/card-issuer";
import { problemSlug } from "@/lib/dakota/cards";

// Dakota refusals for freeze/unfreeze, as user-facing messages
// (DAKOTA-CARDS-SPEC.md §3.5, PATCH /cards/{id}).
const ISSUER_REFUSALS: Record<string, string> = {
  "card-overdrawn": "This card is paused until the balance it owes is paid.",
  "card-freeze-held":
    "This card was reported lost or stolen. Mark it as found before unfreezing it.",
  "cardholder-suspended": "Card access on this account is suspended. Contact support.",
  "card-not-activated": "This card is still being issued. Try again in a moment.",
  "card-closed": "This card is closed.",
};

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

    // Real issuer cards: freeze/unfreeze at the issuer first, so our row never
    // claims a state the card network doesn't enforce.
    if (
      body.status !== undefined &&
      body.status !== current.status &&
      current.externalCardId
    ) {
      if (current.status === "pending") {
        return err("This card is still being issued. Try again in a moment.", 409);
      }
      try {
        const res = await getIssuerProvider().setCardStatus(
          current.externalCardId,
          body.status,
          crypto.randomUUID()
        );
        if (
          res.issuerVersion !== null &&
          res.issuerVersion > (current.issuerVersion ?? -1)
        ) {
          patch.issuerVersion = res.issuerVersion;
        }
      } catch (e) {
        const slug = problemSlug(e);
        if (slug && ISSUER_REFUSALS[slug]) {
          return err(ISSUER_REFUSALS[slug], 409, { reason: slug });
        }
        throw e;
      }
    }

    const [row] = await db
      .update(cards)
      .set(patch)
      .where(and(eq(cards.id, current.id), eq(cards.orgId, user.orgId!)))
      .returning();
    return ok(row);
  },
});
