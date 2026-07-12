// POST /api/transfers/internal
// Atomic book-transfer between two of the caller's own accounts. No Dakota
// involvement — the user's underlying custodial wallet is untouched. Two
// transaction rows are written (debit on source, credit on destination)
// linked by metadata.internal_pair_id, both inside a single DB transaction.

import { apiHandler, ok, err } from "@/lib/api-handler";
import { internalTransferSchema } from "@/lib/validators/transfer";
import { INSUFFICIENT_FUNDS, performInternalTransfer } from "@/lib/transfers";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const POST = apiHandler({
  schema: internalTransferSchema,
  rateLimit: { limit: 60, window: "1h" },
  handler: async ({ user, body }) => {
    // Ownership of BOTH legs before doing anything.
    let from, to;
    try {
      [from, to] = await Promise.all([
        assertAccountOwnership(body.fromAccountId, user.id),
        assertAccountOwnership(body.toAccountId, user.id),
      ]);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (from.status !== "active") {
      return err("Source account is not active", 409);
    }
    if (to.status !== "active") {
      return err("Destination account is not active", 409);
    }
    if (from.currency !== to.currency) {
      return err(
        "Cross-currency internal transfers aren't supported yet",
        409
      );
    }
    if (Number(from.balance) < Number(body.amount)) {
      return err("Insufficient balance", 402);
    }

    try {
      const result = await performInternalTransfer({
        userId: user.id,
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: body.amount,
        note: body.note,
        currency: from.currency,
      });

      return ok(result, 201);
    } catch (e) {
      if (e instanceof Error && e.message === INSUFFICIENT_FUNDS) {
        return err("Insufficient balance", 402);
      }
      throw e;
    }
  },
});
