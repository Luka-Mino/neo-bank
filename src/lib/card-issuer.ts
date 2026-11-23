// Card-issuer abstraction — the swappable slot behind Moneta's card.
//
// Implementations, selected by ISSUING_PROVIDER:
//   mock   (default) — visual-demo behavior: local last4 + expiry, no call.
//   dakota           — Dakota Cards: virtual Visa debit cards that spend
//                      straight from the customer's Dakota wallet. Lead option
//                      since 2026-11-23 (see CARD-ISSUING-PLAN.md and
//                      DAKOTA-CARDS-SPEC.md). Dakota marks Cards sandbox-only.
//   stripe           — Stripe Issuing fallback; not built (throws).
//
// Same pattern as SecretsProvider / email provider: one interface,
// env-selected implementation, dark until configured.

import { and, eq } from "drizzle-orm";
import {
  defaultNetwork,
  generateLast4,
  nextExpiry,
} from "@/lib/cards";
import type { CardType } from "@/lib/validators/card";
import {
  createCard,
  createCardholder,
  findCardholderByExternalId,
  getCardEnablement,
  getCardholder,
  getCardsCapability,
  problemSlug,
  setCardStatus as dakotaSetCardStatus,
} from "@/lib/dakota/cards";

export interface IssueCardRequest {
  userId: string;
  accountId: string;
  cardType: CardType;
  nickname?: string;
  // Cardholder identity the issuer needs (sourced from KYC we already hold).
  cardholder: { name: string; email: string };
}

export interface IssuedCard {
  // The issuer's own card id (Dakota card id, Stripe `ic_...`). Null for mock.
  externalCardId: string | null;
  // Dakota creates cards `pending` with last4 null until activation.
  last4: string | null;
  // Dakota never returns expiry (Cards.js shows it in the browser only).
  expMonth: number | null;
  expYear: number | null;
  network: "visa" | "mastercard";
  // Tokenized PAN reference from the issuer; null for mock and Dakota.
  panToken: string | null;
  // `pending` until the issuer activates it (Dakota: `card.updated` webhook).
  status: "active" | "pending";
  // Issuer's card version for out-of-order webhook protection; null for mock.
  issuerVersion: number | null;
}

/** Statuses a caller can ask the issuer to move a card to. */
export type IssuerTargetStatus = "active" | "frozen" | "closed";

export interface IssuerProvider {
  readonly name: string;
  issueCard(req: IssueCardRequest): Promise<IssuedCard>;
  /** Freeze/unfreeze/close at the issuer. No-op for the mock. */
  setCardStatus(
    externalCardId: string,
    status: IssuerTargetStatus,
    idempotencyKey: string
  ): Promise<{ issuerVersion: number | null }>;
}

/**
 * A card can't be issued yet because a prerequisite isn't met. `reason` is a
 * stable code for the UI; `message` is safe to show the user.
 */
export class CardIssuerNotReadyError extends Error {
  constructor(
    public reason:
      | "not_onboarded"
      | "terms_required"
      | "capability_enabling"
      | "capability_unavailable"
      | "cardholder_pending"
      | "cardholder_blocked"
      | "wallet_not_enabled",
    message: string
  ) {
    super(message);
    this.name = "CardIssuerNotReadyError";
  }
}

export { mapDakotaCardStatus } from "@/lib/dakota/cards";

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
      status: "active",
      issuerVersion: null,
    };
  }

  async setCardStatus(): Promise<{ issuerVersion: number | null }> {
    return { issuerVersion: null };
  }
}

// --- Dakota Cards ------------------------------------------------------------

export interface DakotaIds {
  customerId: string;
  walletId: string;
  cardholderId: string | null;
}

export interface DakotaCardDeps {
  /** Look up the user's Dakota customer, wallet and cardholder ids. */
  resolveIds(userId: string): Promise<DakotaIds | null>;
  /** Persist a newly created/found cardholder id for the user. */
  saveCardholderId(userId: string, cardholderId: string): Promise<void>;
}

export class DakotaCardProvider implements IssuerProvider {
  readonly name = "dakota";

  constructor(private deps: DakotaCardDeps = defaultDakotaDeps) {}

  async issueCard(req: IssueCardRequest): Promise<IssuedCard> {
    const ids = await this.deps.resolveIds(req.userId);
    if (!ids) {
      throw new CardIssuerNotReadyError(
        "not_onboarded",
        "Finish verifying your identity before getting a card."
      );
    }

    // 1. The customer's Cards capability (terms accepted, account switched on).
    const cap = await getCardsCapability(ids.customerId);
    if (!cap || cap.status !== "available") {
      const status = cap?.status ?? "unavailable";
      if (status === "action_required") {
        throw new CardIssuerNotReadyError(
          "terms_required",
          "Accept the card terms to get your card."
        );
      }
      if (status === "enabling") {
        throw new CardIssuerNotReadyError(
          "capability_enabling",
          "Cards are being set up on your account. Try again in a moment."
        );
      }
      throw new CardIssuerNotReadyError(
        "capability_unavailable",
        "Cards aren't available for this account yet."
      );
    }

    // 2. Cardholder: reuse, or create (external_id = our user id).
    const cardholder = await this.ensureCardholder(req.userId, ids);
    if (cardholder.status !== "active") {
      if (
        cardholder.status === "declined" ||
        cardholder.status === "suspended" ||
        cardholder.status === "closed"
      ) {
        throw new CardIssuerNotReadyError(
          "cardholder_blocked",
          "We can't issue a card on this account. Contact support."
        );
      }
      throw new CardIssuerNotReadyError(
        "cardholder_pending",
        "We're checking your details for cards — usually a few seconds. Try again shortly."
      );
    }

    // 3. Wallet card enablement (a one-time signed grant). Not automated yet:
    //    it needs a per-wallet policy and Dakota's confirmation that our
    //    platform signer may sign it. See DAKOTA-CARDS-SPEC.md §2.3.
    const enablement = await getCardEnablement(ids.walletId);
    if (enablement.state !== "active") {
      throw new CardIssuerNotReadyError(
        "wallet_not_enabled",
        "Card spending isn't switched on for your account yet."
      );
    }

    // 4. Issue. Dakota returns `pending`; activation arrives by webhook.
    const card = await createCard(ids.customerId, {
      cardholder_id: cardholder.id,
      wallet_id: ids.walletId,
      nickname: req.nickname,
      external_id: req.accountId,
    });

    return {
      externalCardId: card.id,
      last4: card.last4 ?? null,
      expMonth: null,
      expYear: null,
      network: "visa",
      panToken: null,
      status: card.status === "active" ? "active" : "pending",
      issuerVersion: card.version ?? null,
    };
  }

  async setCardStatus(
    externalCardId: string,
    status: IssuerTargetStatus,
    idempotencyKey: string
  ): Promise<{ issuerVersion: number | null }> {
    const card = await dakotaSetCardStatus(externalCardId, status, idempotencyKey);
    return { issuerVersion: card.version ?? null };
  }

  private async ensureCardholder(userId: string, ids: DakotaIds) {
    if (ids.cardholderId) return getCardholder(ids.cardholderId);
    try {
      const created = await createCardholder(ids.customerId, { external_id: userId });
      await this.deps.saveCardholderId(userId, created.id);
      return created;
    } catch (e) {
      // An individual customer may hold one cardholder; reuse the existing one.
      if (problemSlug(e) === "cardholder-already-exists") {
        const existing = await findCardholderByExternalId(ids.customerId, userId);
        if (existing) {
          await this.deps.saveCardholderId(userId, existing.id);
          return existing;
        }
      }
      throw e;
    }
  }
}

const defaultDakotaDeps: DakotaCardDeps = {
  async resolveIds(userId) {
    const { db } = await import("@/lib/db");
    const { dakotaCustomers, wallets } = await import("@/lib/db/schema");
    const [customer] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, userId))
      .limit(1);
    if (!customer || customer.kycStatus !== "active") return null;
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    if (!wallet) return null;
    return {
      customerId: customer.dakotaCustomerId,
      walletId: wallet.dakotaWalletId,
      cardholderId: customer.dakotaCardholderId ?? null,
    };
  },
  async saveCardholderId(userId, cardholderId) {
    const { db } = await import("@/lib/db");
    const { dakotaCustomers } = await import("@/lib/db/schema");
    await db
      .update(dakotaCustomers)
      .set({ dakotaCardholderId: cardholderId, updatedAt: new Date() })
      .where(and(eq(dakotaCustomers.userId, userId)));
  },
};

// --- Stripe Issuing: documented fallback, not built ---------------------------

class StripeIssuingProvider implements IssuerProvider {
  readonly name = "stripe";

  async issueCard(_req: IssueCardRequest): Promise<IssuedCard> {
    // Fallback path (needs a registered corp + live Stripe Issuing account):
    //   1. Find-or-create a Stripe Cardholder (name, email, billing address).
    //   2. stripe.issuing.cards.create({ cardholder, type, currency: "usd" }).
    //   3. Authorization decisioning in /api/webhooks/stripe-issuing.
    throw new Error(
      "StripeIssuingProvider is not configured — Dakota Cards is the lead option. " +
        "See CARD-ISSUING-PLAN.md."
    );
  }

  async setCardStatus(): Promise<{ issuerVersion: number | null }> {
    throw new Error("StripeIssuingProvider is not configured.");
  }
}

// --- Selector ---------------------------------------------------------------

let cached: IssuerProvider | null = null;

/**
 * Returns the active issuer provider. Defaults to the mock so nothing breaks
 * until real credentials exist. ISSUING_PROVIDER=dakota | stripe | mock.
 */
export function getIssuerProvider(): IssuerProvider {
  if (cached) return cached;
  const which = process.env.ISSUING_PROVIDER ?? "mock";
  cached =
    which === "dakota"
      ? new DakotaCardProvider()
      : which === "stripe"
        ? new StripeIssuingProvider()
        : new MockIssuerProvider();
  return cached;
}

// Test seam — reset the memoized provider between cases.
export function __resetIssuerProvider(): void {
  cached = null;
}
