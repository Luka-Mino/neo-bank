// Dakota Cards API wrappers. Field names, paths and statuses follow
// DAKOTA-CARDS-SPEC.md (compiled from docs.dakota.xyz, 2026-11-23).
//
// Status: Dakota marks every Cards endpoint "sandbox only" and says fields can
// still change. Everything here is dark until ISSUING_PROVIDER=dakota.

import { dakota, DakotaApiError } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CapabilityStatus = "available" | "enabling" | "action_required" | "unavailable";

export interface CustomerCapability {
  capability: string;
  status: CapabilityStatus;
  requirements: Array<Record<string, unknown>>;
  reason?: string;
}

export type CardholderStatus =
  | "pending"
  | "under_review"
  | "request_for_information"
  | "active"
  | "suspended"
  | "declined"
  | "closed";

export interface DakotaCardholder {
  id: string;
  customer_id: string;
  status: CardholderStatus;
  external_id?: string | null;
}

export type CardEnablementState =
  | "not_enabled"
  | "attaching"
  | "active"
  | "detach_requested"
  | "detached";

export interface CardEnablement {
  state: CardEnablementState;
  settlement_destination?: unknown;
  spend_asset?: string;
  spend_network_id?: string;
}

export type DakotaCardStatus = "pending" | "active" | "frozen" | "overdrawn" | "closed";

export interface DakotaCard {
  id: string;
  cardholder_id: string;
  customer_id: string;
  wallet_id: string;
  status: DakotaCardStatus;
  version: number;
  last4?: string | null;
  nickname?: string | null;
  freeze_sources?: string[];
  spend_asset?: string;
  spend_network_id?: string;
}

export interface RevealSession {
  session: string;
  expires_at: string;
}

/** Map a Dakota card status onto Moneta's `cards.status` vocabulary. */
export function mapDakotaCardStatus(
  s: DakotaCardStatus
): "pending" | "active" | "frozen" | "canceled" {
  switch (s) {
    case "pending":
      return "pending";
    case "active":
      return "active";
    case "frozen":
    case "overdrawn": // declining until the wallet's card debt is paid
      return "frozen";
    case "closed":
      return "canceled";
  }
}

// ─── Error helpers ───────────────────────────────────────────────────────────

/** Dakota problem types end in `#<slug>`; switch on the slug. */
export function problemSlug(err: unknown): string | null {
  if (!(err instanceof DakotaApiError)) return null;
  const hash = err.type?.lastIndexOf("#") ?? -1;
  return hash >= 0 ? err.type.slice(hash + 1) : err.type || null;
}

// ─── Calls ───────────────────────────────────────────────────────────────────

/** The customer's `cards` capability, or null if Dakota doesn't list one. */
export async function getCardsCapability(
  customerId: string
): Promise<CustomerCapability | null> {
  const res = await dakota.get<{ capabilities: CustomerCapability[] }>(
    `/customers/${customerId}/capabilities`
  );
  return res.capabilities.find((c) => c.capability === "cards") ?? null;
}

/** Individual customers: name/email/phone come from the KYC application. */
export async function createCardholder(
  customerId: string,
  body: { external_id: string; phone?: string }
): Promise<DakotaCardholder> {
  return dakota.post<DakotaCardholder>(`/customers/${customerId}/cardholders`, body);
}

export async function getCardholder(cardholderId: string): Promise<DakotaCardholder> {
  return dakota.get<DakotaCardholder>(`/cardholders/${cardholderId}`);
}

export async function findCardholderByExternalId(
  customerId: string,
  externalId: string
): Promise<DakotaCardholder | null> {
  const res = await dakota.get<{ data: DakotaCardholder[] }>(
    `/customers/${customerId}/cardholders`,
    { external_id: externalId, limit: "10" }
  );
  return res.data.find((c) => c.status !== "closed") ?? null;
}

export async function getCardEnablement(walletId: string): Promise<CardEnablement> {
  return dakota.get<CardEnablement>(`/wallets/${walletId}/card_enablement`);
}

export async function createCard(
  customerId: string,
  body: {
    cardholder_id: string;
    wallet_id: string;
    nickname?: string;
    external_id?: string;
  }
): Promise<DakotaCard> {
  return dakota.post<DakotaCard>(`/customers/${customerId}/cards`, {
    currency: "USD",
    ...body,
  });
}

export async function getCard(cardId: string): Promise<DakotaCard> {
  return dakota.get<DakotaCard>(`/cards/${cardId}`);
}

/** Freeze (`frozen`), unfreeze (`active`) or close (`closed`, permanent). */
export async function setCardStatus(
  cardId: string,
  status: "active" | "frozen" | "closed",
  idempotencyKey: string
): Promise<DakotaCard> {
  return dakota.patch<DakotaCard>(`/cards/${cardId}`, { status }, { idempotencyKey });
}

/**
 * Mint a single-use, 5-minute session for Cards.js to reveal PAN/CVV/expiry
 * in Lithic-hosted frames. MUST NOT carry an idempotency key. `origin` is the
 * exact HTTPS origin of the page (no trailing slash; http://localhost is
 * rejected by Dakota). Never log the returned session.
 */
export async function createRevealSession(
  cardId: string,
  origin: string
): Promise<RevealSession> {
  return dakota.post<RevealSession>(
    `/cards/${cardId}/reveal_session`,
    { session_type: "card_details", origin },
    { idempotency: "none" }
  );
}
