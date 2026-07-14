// DELETE /api/users — account deletion (GDPR/CCPA erasure, adapted for a
// regulated money app). This ANONYMIZES and closes the account rather than
// hard-deleting: PII is scrubbed and login disabled, but transaction and
// audit records are retained because AML/BSA law requires multi-year
// retention. Blocked while any account holds a balance or has money in
// flight — the user must move funds out first.
import { and, eq, ne, sql } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, accounts, cards, transactions } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { revokeSessions } from "@/lib/auth/sessions";

export const DELETE = apiHandler({
  rateLimit: { limit: 3, window: "1h" },
  handler: async ({ user }) => {
    // Refuse if any open account still holds money.
    const funded = await db
      .select({ id: accounts.id, balance: accounts.balance })
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), ne(accounts.status, "closed")));
    const hasFunds = funded.some((a) => Number(a.balance) > 0);
    if (hasFunds) {
      return err(
        "Move all funds out of your accounts before deleting. Your balance isn't zero.",
        409
      );
    }

    // Refuse if any transaction is still in flight (non-terminal).
    const [inFlight] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          sql`${transactions.status} NOT IN ('completed','failed','canceled','cancelled','rejected','invalid','returned','reversed','timed_out')`
        )
      )
      .limit(1);
    if (inFlight) {
      return err(
        "You have a transaction still in progress. Try again once it settles.",
        409
      );
    }

    const tombstone = `deleted+${user.id}@moneta.invalid`;

    await db.transaction(async (tx) => {
      // Scrub PII + disable login (clear password, 2FA, secrets).
      await tx
        .update(users)
        .set({
          email: tombstone,
          fullName: "Deleted user",
          phone: null,
          passwordHash: "",
          totpSecret: null,
          totpEnabledAt: null,
          emailOtpEnabled: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Close accounts and freeze cards (records retained for AML).
      await tx
        .update(accounts)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(accounts.userId, user.id));
      await tx
        .update(cards)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(cards.userId, user.id));
    });

    // Invalidate every session and record the erasure (audit log is retained).
    await revokeSessions(user.id, "account_deleted");
    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "account_deleted",
      resourceType: "user",
      resourceId: user.id,
      metadata: { retention: "financial records retained per AML/BSA" },
    });

    return ok({ deleted: true });
  },
});
