// Authorization decision engine — the 2-second approve/decline at the heart
// of Moneta's card.
//
// Pure and synchronous by design: given a card authorization request and the
// card's ledger context, return approve/decline with a reason. The webhook
// route (/api/webhooks/stripe-issuing) loads the context and returns the
// { approved } decision to Stripe within its 2s window. Keeping this a pure
// function means the money-gating logic is fully unit-testable with no Stripe
// account, no database, and no clock. See CARD-ISSUING-PLAN.md.

export type DeclineReason =
  | "invalid_amount"
  | "unsupported_currency"
  | "card_not_found"
  | "card_inactive"
  | "account_inactive"
  | "insufficient_funds";

export interface AuthorizationRequest {
  /** Requested amount in minor units (cents), from Stripe pending_request.amount. */
  amountCents: number;
  /** ISO currency, lowercase (e.g. "usd"). */
  currency: string;
}

export interface CardAuthContext {
  /** cards.status — 'active' | 'frozen' | 'replaced' | 'canceled'. */
  cardStatus: string;
  /** accounts.status — 'active' | 'frozen' | 'closed'. */
  accountStatus: string;
  /** Available balance on the card's account, floored to whole cents. */
  availableBalanceCents: number;
}

export interface AuthDecision {
  approved: boolean;
  reason?: DeclineReason;
}

const APPROVE: AuthDecision = { approved: true };
const decline = (reason: DeclineReason): AuthDecision => ({
  approved: false,
  reason,
});

/**
 * Decide a card authorization. Fail-closed everywhere: an unmapped card, a
 * non-USD request, or any non-active state declines rather than approves.
 *
 * @param ctx  the card's ledger context, or null when the incoming card id
 *             maps to no card we issued (never approve an unknown card).
 */
export function decideAuthorization(
  req: AuthorizationRequest,
  ctx: CardAuthContext | null
): AuthDecision {
  // Amount must be a whole, non-negative number of cents.
  if (!Number.isInteger(req.amountCents) || req.amountCents < 0) {
    return decline("invalid_amount");
  }
  // We only back USD today (single-currency ledger).
  if (req.currency.toLowerCase() !== "usd") {
    return decline("unsupported_currency");
  }
  // No mapping → decline safe.
  if (!ctx) return decline("card_not_found");
  if (ctx.cardStatus !== "active") return decline("card_inactive");
  if (ctx.accountStatus !== "active") return decline("account_inactive");
  // Zero-amount authorizations (card verification / $0 auth) hold no funds.
  if (req.amountCents === 0) return APPROVE;
  if (ctx.availableBalanceCents < req.amountCents) {
    return decline("insufficient_funds");
  }
  return APPROVE;
}

/** Convert a numeric(30,18) dollar balance string to whole cents (floored). */
export function dollarsToCents(balance: string | number): number {
  const n = typeof balance === "number" ? balance : Number(balance);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n * 100);
}
