// Service-layer ownership checks. Every account- or card-scoped API route
// MUST call one of these helpers before reading or writing — UI gates are
// not sufficient.

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, cards } from "@/lib/db/schema";

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

/**
 * Loads an account and verifies the caller owns it. Throws NotFoundError if
 * the row doesn't exist (no information leaked about other users' rows) and
 * ForbiddenError if it exists but belongs to someone else.
 */
export async function assertAccountOwnership(
  accountId: string,
  userId: string
): Promise<typeof accounts.$inferSelect> {
  const [row] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!row) throw new NotFoundError("Account not found");
  if (row.userId !== userId) throw new ForbiddenError("Account not yours");
  return row;
}

/**
 * Same for cards. Returns the card row so the caller can use other fields
 * (status, last4, accountId) without re-querying.
 */
export async function assertCardOwnership(
  cardId: string,
  userId: string
): Promise<typeof cards.$inferSelect> {
  const [row] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  if (!row) throw new NotFoundError("Card not found");
  if (row.userId !== userId) throw new ForbiddenError("Card not yours");
  return row;
}

/**
 * Maps an ownership/not-found error into the api-handler `err()` shape.
 * Use in route handlers:
 *   try { await assertAccountOwnership(...) } catch (e) { return ownershipErr(e) }
 */
export function ownershipErr(
  e: unknown
): { status: number; message: string } | null {
  if (e instanceof ForbiddenError) return { status: 403, message: e.message };
  if (e instanceof NotFoundError) return { status: 404, message: e.message };
  return null;
}
