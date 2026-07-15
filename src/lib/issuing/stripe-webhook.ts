// Stripe webhook signature verification — hand-rolled HMAC-SHA256, matching
// the codebase's approach of verifying provider webhooks directly rather than
// pulling a full vendor SDK (see the Dakota Ed25519 verifier).
//
// Stripe signs with the `Stripe-Signature` header: `t=<unix>,v1=<hex>[,v1=...]`
// where the signed payload is `${t}.${rawBody}` and v1 is HMAC-SHA256(secret,
// signedPayload). Multiple v1 entries appear during secret rotation. We reject
// stale timestamps as a replay guard.

import crypto from "node:crypto";

const DEFAULT_TOLERANCE_SEC = 300; // 5 minutes, Stripe's default

/**
 * Verify a Stripe webhook signature. `nowSec` is injected (not read from the
 * clock) so this stays a pure, testable function.
 */
export function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
  nowSec: number,
  toleranceSec: number = DEFAULT_TOLERANCE_SEC
): boolean {
  if (!sigHeader || !secret) return false;

  let t = NaN;
  const v1s: string[] = [];
  for (const part of sigHeader.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key === "t") t = Number(val);
    else if (key === "v1") v1s.push(val);
  }
  if (!Number.isFinite(t) || v1s.length === 0) return false;

  // Replay guard: reject timestamps outside tolerance in either direction.
  if (Math.abs(nowSec - t) > toleranceSec) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");

  // Timing-safe compare against every provided v1 (rotation-safe).
  return v1s.some((v1) => {
    const given = Buffer.from(v1, "utf8");
    return (
      given.length === expectedBuf.length &&
      crypto.timingSafeEqual(given, expectedBuf)
    );
  });
}

// Minimal shape of the Stripe issuing authorization event we act on. We read
// defensively (optional chaining at the call site) rather than trust the wire.
export interface StripeIssuingEvent {
  type: string;
  data?: { object?: StripeIssuingAuthorization };
}

export interface StripeIssuingAuthorization {
  id?: string;
  amount?: number;
  currency?: string;
  pending_request?: { amount?: number; currency?: string };
  card?: { id?: string };
}

/** Parse a raw webhook body into an event, or null if it isn't valid JSON. */
export function parseStripeEvent(rawBody: string): StripeIssuingEvent | null {
  try {
    const parsed = JSON.parse(rawBody);
    if (parsed && typeof parsed.type === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}
