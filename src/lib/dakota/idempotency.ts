import { v5 as uuidv5 } from "uuid";

// Fixed namespace for deterministic Dakota idempotency keys — never change
// this, or retried operations will stop matching their original keys and
// Dakota will create duplicate resources instead of replaying responses.
const MONETA_IDEMPOTENCY_NAMESPACE = "8f3a9b21-64c7-45de-9d02-7c1e5a80b4f6";

/**
 * Same scope string → same UUID, always. Use for any Dakota POST that must
 * be safely retryable (Dakota replays the cached response for a repeated
 * idempotency key instead of re-executing).
 */
export function deterministicIdempotencyKey(scope: string): string {
  return uuidv5(scope, MONETA_IDEMPOTENCY_NAMESPACE);
}
