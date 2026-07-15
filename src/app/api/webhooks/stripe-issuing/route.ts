// Stripe Issuing webhook receiver — the real-time authorization gate.
//
// On every card swipe Stripe POSTs `issuing_authorization.request` and reads
// our `{ approved }` response synchronously (≤2s, else its timeout default
// applies). We verify the signature, map the Stripe card to our card, and
// decide against the Moneta ledger. All other issuing events are acked for
// later reconciliation (stubbed).
//
// Dark until we incorporate + wire Stripe Issuing: returns 501 unless
// ISSUING_PROVIDER=stripe and STRIPE_ISSUING_WEBHOOK_SECRET are both set, so
// it never silently pretends to work. See CARD-ISSUING-PLAN.md.

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { accounts, cards } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import {
  decideAuthorization,
  dollarsToCents,
  type CardAuthContext,
} from "@/lib/issuing/authorization";
import {
  parseStripeEvent,
  verifyStripeSignature,
  type StripeIssuingAuthorization,
} from "@/lib/issuing/stripe-webhook";

// Issuing webhook bodies are small JSON; reject anything larger before work.
const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

function webhookSecret(): string | null {
  if (process.env.ISSUING_PROVIDER !== "stripe") return null;
  return process.env.STRIPE_ISSUING_WEBHOOK_SECRET ?? null;
}

/** Load the ledger context for the Stripe card id, or null if we don't issue it. */
async function loadCardContext(
  externalCardId: string
): Promise<CardAuthContext | null> {
  const [row] = await db
    .select({
      cardStatus: cards.status,
      accountStatus: accounts.status,
      balance: accounts.balance,
    })
    .from(cards)
    .innerJoin(accounts, eq(cards.accountId, accounts.id))
    .where(eq(cards.externalCardId, externalCardId))
    .limit(1);

  if (!row) return null;
  return {
    cardStatus: row.cardStatus,
    accountStatus: row.accountStatus,
    availableBalanceCents: dollarsToCents(row.balance),
  };
}

async function decideForAuthorization(auth: StripeIssuingAuthorization) {
  const amountCents = auth.pending_request?.amount ?? auth.amount ?? -1;
  const currency = auth.pending_request?.currency ?? auth.currency ?? "usd";
  const externalCardId = auth.card?.id ?? null;

  const ctx = externalCardId ? await loadCardContext(externalCardId) : null;
  const decision = decideAuthorization({ amountCents, currency }, ctx);

  logger.info("issuing.authorization.decided", {
    authorizationId: auth.id,
    externalCardId,
    amountCents,
    approved: decision.approved,
    reason: decision.reason,
  });
  return decision;
}

export async function POST(req: NextRequest) {
  const secret = webhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Issuing webhook not configured" },
      { status: 501 }
    );
  }

  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const valid = verifyStripeSignature(
    rawBody,
    req.headers.get("stripe-signature"),
    secret,
    nowSec
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = parseStripeEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  // The synchronous authorization decision Stripe reads inline.
  if (event.type === "issuing_authorization.request") {
    const auth = event.data?.object ?? {};
    const decision = await decideForAuthorization(auth);
    return NextResponse.json({
      approved: decision.approved,
      ...(decision.reason
        ? { metadata: { decline_reason: decision.reason } }
        : {}),
    });
  }

  // authorization.created/updated, transaction.created, card.* → reconcile to
  // the ledger. Stubbed for now; ack so Stripe doesn't retry.
  logger.info("issuing.webhook.unhandled", { type: event.type });
  return NextResponse.json({ received: true });
}
