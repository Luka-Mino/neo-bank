// Service-layer ownership checks. Every account/card/recipient/destination-
// scoped API route MUST call one of these before reading or writing — UI gates
// are not sufficient.
//
// All checks are ORG-scoped. Cross-org (or non-existent) rows throw
// NotFoundError (404) — we never reveal that a row exists in another org (no
// enumeration oracle). Callers pass the request's scoped db (`ctx.db`) so the
// RLS GUC applies once RLS is enabled (0018); the explicit org predicate is
// defense-in-depth that also holds before RLS. See ORG-FOUNDATION-SPEC.md.

import { and, eq } from "drizzle-orm";
import { accounts, cards, recipients, destinations } from "@/lib/db/schema";
import type { DbTx } from "@/lib/db/with-org";

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Load an account owned by `orgId`. NotFoundError if missing or another org's. */
export async function assertAccountOwnership(
  dbc: DbTx,
  accountId: string,
  orgId: string
): Promise<typeof accounts.$inferSelect> {
  const [row] = await dbc
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.orgId, orgId)))
    .limit(1);
  if (!row) throw new NotFoundError("Account not found");
  return row;
}

/** Load a card owned by `orgId`. Returns the row so callers reuse its fields. */
export async function assertCardOwnership(
  dbc: DbTx,
  cardId: string,
  orgId: string
): Promise<typeof cards.$inferSelect> {
  const [row] = await dbc
    .select()
    .from(cards)
    .where(and(eq(cards.id, cardId), eq(cards.orgId, orgId)))
    .limit(1);
  if (!row) throw new NotFoundError("Card not found");
  return row;
}

/** Load a recipient owned by `orgId`. */
export async function assertRecipientOwnership(
  dbc: DbTx,
  recipientId: string,
  orgId: string
): Promise<typeof recipients.$inferSelect> {
  const [row] = await dbc
    .select()
    .from(recipients)
    .where(and(eq(recipients.id, recipientId), eq(recipients.orgId, orgId)))
    .limit(1);
  if (!row) throw new NotFoundError("Recipient not found");
  return row;
}

/**
 * Verify a Dakota destination belongs to `orgId` (via its recipient). This is
 * the check that stops a payment being sent to another tenant's payout endpoint.
 */
export async function assertDestinationOwnership(
  dbc: DbTx,
  dakotaDestinationId: string,
  orgId: string
): Promise<typeof destinations.$inferSelect> {
  const [row] = await dbc
    .select({ dest: destinations })
    .from(destinations)
    .innerJoin(recipients, eq(recipients.id, destinations.recipientId))
    .where(
      and(
        eq(destinations.dakotaDestinationId, dakotaDestinationId),
        eq(recipients.orgId, orgId)
      )
    )
    .limit(1);
  if (!row) throw new NotFoundError("Destination not found");
  return row.dest;
}

/**
 * Maps an ownership/not-found error into the api-handler `err()` shape.
 *   try { await assertAccountOwnership(...) } catch (e) { const o = ownershipErr(e); if (o) return err(o.message, o.status); throw e; }
 */
export function ownershipErr(
  e: unknown
): { status: number; message: string } | null {
  if (e instanceof ForbiddenError) return { status: 403, message: e.message };
  if (e instanceof NotFoundError) return { status: 404, message: e.message };
  return null;
}
