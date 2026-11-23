// POST /api/cards/[id]/reveal-session
//
// Backend half of Dakota Cards.js `fetchSession` (DAKOTA-CARDS-SPEC.md §6.3).
// Mints a single-use, 5-minute session so the browser can show the card's
// number, expiry and CVV inside Lithic-hosted frames. Card data never passes
// through this server; we only vouch that the caller may see this card.
//
// Body: { sessionType: "card_details", origin: window.location.origin }
// 200:  { session, expiresAt }  — never log the session value.

import { z } from "zod";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { assertCardOwnership, ownershipErr } from "@/lib/auth/ownership";
import { createRevealSession } from "@/lib/dakota/cards";
import { DakotaApiError } from "@/lib/dakota/client";

const revealSchema = z.object({
  sessionType: z.literal("card_details"),
  origin: z.string().min(1).max(200),
});

/** Our one trusted page origin: HTTPS, scheme+host(+port), no trailing slash. */
function trustedOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u.origin : null;
  } catch {
    return null;
  }
}

export const POST = apiHandler({
  orgScoped: true,
  schema: revealSchema,
  // Dakota caps reveal sessions at 60/min account-wide; keep one user from
  // using that up.
  rateLimit: { limit: 20, window: "15m" },
  handler: async ({ user, params, body, db }) => {
    if (process.env.ISSUING_PROVIDER !== "dakota") {
      return err("Card details aren't available.", 404);
    }

    let card;
    try {
      card = await assertCardOwnership(db, params.id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    // Org membership lets teammates manage a card; only its own cardholder
    // may see the full number.
    if (card.userId !== user.id) return err("Not found", 404);

    // Dakota refuses (sometimes with a 5xx) for cards that aren't active.
    if (!card.externalCardId || card.status !== "active") {
      return err("Card details aren't available for this card right now.", 409);
    }

    // Never forward an origin we don't own (Dakota also rejects http://).
    const expected = trustedOrigin();
    if (!expected || body.origin !== expected) {
      return err("Invalid origin", 400);
    }

    try {
      const s = await createRevealSession(card.externalCardId, body.origin);
      return ok({ session: s.session, expiresAt: s.expires_at });
    } catch (e) {
      if (e instanceof DakotaApiError) {
        // Cards.js only needs a 4xx/5xx to show its retryable error state.
        return err(
          "Couldn't open card details. Try again.",
          e.status >= 500 ? 502 : e.status
        );
      }
      throw e;
    }
  },
});
