// Card-issuer abstraction — the swappable slot behind Moneta's card.
//
// Today the only implementation is `MockIssuerProvider` (the visual-demo
// behavior: locally-generated last4 + expiry, no external call). When we
// incorporate and wire a real program, `StripeIssuingProvider` gets a body
// and `ISSUING_PROVIDER=stripe` flips it on — no call site changes.
//
// This mirrors the SecretsProvider / email-provider pattern already in the
// codebase: one interface, env-selected implementation, dark-until-configured.
// See CARD-ISSUING-PLAN.md for the funding-model decision this defers.

import {
  defaultNetwork,
  generateLast4,
  nextExpiry,
} from "@/lib/cards";
import type { CardType } from "@/lib/validators/card";

export interface IssueCardRequest {
  userId: string;
  accountId: string;
  cardType: CardType;
  // Cardholder identity the issuer needs (sourced from KYC we already hold).
  // Address is omitted for the mock; a real provider requires billing address.
  cardholder: { name: string; email: string };
}

export interface IssuedCard {
  // The issuer's own card id (e.g. Stripe `ic_...`). Null for the mock — no
  // schema column persists it yet; the real integration adds `external_card_id`.
  externalCardId: string | null;
  last4: string;
  expMonth: number;
  expYear: number;
  network: "visa" | "mastercard";
  // Tokenized PAN reference from the issuer; null for the mock.
  panToken: string | null;
}

export interface IssuerProvider {
  readonly name: string;
  issueCard(req: IssueCardRequest): Promise<IssuedCard>;
}

// --- Mock: current demo behavior, no external issuer ------------------------

class MockIssuerProvider implements IssuerProvider {
  readonly name = "mock";

  async issueCard(_req: IssueCardRequest): Promise<IssuedCard> {
    const exp = nextExpiry();
    return {
      externalCardId: null,
      last4: generateLast4(),
      expMonth: exp.month,
      expYear: exp.year,
      network: defaultNetwork(),
      panToken: null,
    };
  }
}

// --- Stripe Issuing: real integration, dark until incorporated --------------

class StripeIssuingProvider implements IssuerProvider {
  readonly name = "stripe";

  async issueCard(_req: IssueCardRequest): Promise<IssuedCard> {
    // Real flow (blocked on a registered corp + a live Stripe Issuing account):
    //   1. Find-or-create a Stripe Cardholder for req.userId (name, email,
    //      billing address from KYC).
    //   2. stripe.issuing.cards.create({ cardholder, type, currency: "usd",
    //      spending_controls }) → returns ic_..., last4, exp, network.
    //   3. Map the result into IssuedCard (externalCardId = ic_..., panToken
    //      = the card's number token).
    // Authorization decisioning lives in /api/webhooks/stripe-issuing (the
    // 2-second approve/decline against the Moneta ledger) — see the plan doc.
    throw new Error(
      "StripeIssuingProvider is not configured yet — see CARD-ISSUING-PLAN.md. " +
        "Set ISSUING_PROVIDER=stripe with live Stripe Issuing credentials."
    );
  }
}

// --- Selector ---------------------------------------------------------------

let cached: IssuerProvider | null = null;

/**
 * Returns the active issuer provider. Defaults to the mock so nothing breaks
 * until real credentials + a corp exist. Flip with ISSUING_PROVIDER=stripe.
 */
export function getIssuerProvider(): IssuerProvider {
  if (cached) return cached;
  const which = process.env.ISSUING_PROVIDER ?? "mock";
  cached = which === "stripe" ? new StripeIssuingProvider() : new MockIssuerProvider();
  return cached;
}

// Test seam — reset the memoized provider between cases.
export function __resetIssuerProvider(): void {
  cached = null;
}
