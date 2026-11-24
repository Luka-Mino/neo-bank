// GET    /api/accounts/[id]  → fetch one of the org's accounts
// PATCH  /api/accounts/[id]  → rename, set a goal, freeze/activate
// DELETE /api/accounts/[id]  → soft-close (status = 'closed')

import { and, eq, ne } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { accounts, cards } from "@/lib/db/schema";
import { updateAccountSchema } from "@/lib/validators/account";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, db }) => {
    try {
      const row = await assertAccountOwnership(db, params.id, user.orgId!);
      return ok(row);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }
  },
});

export const PATCH = apiHandler({
  orgScoped: true,
  schema: updateAccountSchema,
  handler: async ({ user, params, body, db }) => {
    let current: typeof accounts.$inferSelect;
    try {
      current = await assertAccountOwnership(db, params.id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (current.status === "closed") {
      return err("Closed accounts cannot be modified", 409);
    }

    // The main account is fixed: deposits land in it and its money lives in
    // the main wallet (SIDE-ACCOUNTS-PLAN.md), so it can't be swapped.
    if (body.setPrimary === true && !current.isPrimary) {
      return err("Your main account can't be changed. Deposits always land there.", 409, { reason: "main_fixed" });
    }

    // Plain rename / freeze / unfreeze.
    const patch: Partial<typeof accounts.$inferInsert> = { updatedAt: new Date() };
    if (body.nickname !== undefined) patch.nickname = body.nickname;
    if (body.goalAmount !== undefined) patch.goalAmount = body.goalAmount;
    if (body.status !== undefined) patch.status = body.status;

    const [row] = await db
      .update(accounts)
      .set(patch)
      .where(and(eq(accounts.id, current.id), eq(accounts.orgId, user.orgId!)))
      .returning();
    return ok(row);
  },
});

export const DELETE = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, db }) => {
    let current: typeof accounts.$inferSelect;
    try {
      current = await assertAccountOwnership(db, params.id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (current.status === "closed") {
      return ok({ status: "already_closed" });
    }

    if (Number(current.balance) !== 0) {
      return err(
        "Account has a non-zero balance. Move funds out before closing.",
        409
      );
    }

    const activeCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(
        and(eq(cards.accountId, current.id), ne(cards.status, "canceled"))
      );
    if (activeCards.length > 0) {
      return err("Cancel this account's card before closing it.", 409);
    }

    // The main account goes last: side accounts are funded from it, and
    // deposits land in it. (No more promoting another account to main.)
    if (current.isPrimary) {
      const sides = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.orgId, user.orgId!),
            eq(accounts.isPrimary, false),
            ne(accounts.status, "closed")
          )
        )
        .limit(1);
      if (sides.length > 0) {
        return err("Close your side accounts before closing your main account.", 409, { reason: "side_accounts_open" });
      }
    }

    const [row] = await db
      .update(accounts)
      .set({
        status: "closed",
        isPrimary: false,
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, current.id), eq(accounts.orgId, user.orgId!)))
      .returning();

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "account_closed",
      resourceType: "account",
      resourceId: row.id,
    });
    return ok(row);
  },
});
