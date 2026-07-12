// GET    /api/accounts/[id]  → fetch one of the caller's accounts
// PATCH  /api/accounts/[id]  → rename, freeze/activate, or set as primary
// DELETE /api/accounts/[id]  → soft-close (status = 'closed')

import { and, eq, ne, sql } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { accounts, cards } from "@/lib/db/schema";
import { updateAccountSchema } from "@/lib/validators/account";
import {
  assertAccountOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const GET = apiHandler({
  handler: async ({ user, params }) => {
    try {
      const row = await assertAccountOwnership(params.id, user.id);
      return ok(row);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }
  },
});

export const PATCH = apiHandler({
  schema: updateAccountSchema,
  handler: async ({ user, params, body }) => {
    let current: typeof accounts.$inferSelect;
    try {
      current = await assertAccountOwnership(params.id, user.id);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    if (current.status === "closed") {
      return err("Closed accounts cannot be modified", 409);
    }

    // setPrimary requires demoting the existing primary atomically.
    if (body.setPrimary === true && !current.isPrimary) {
      const updated = await db.transaction(async (tx) => {
        await tx
          .update(accounts)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(
            and(
              eq(accounts.userId, user.id),
              eq(accounts.isPrimary, true),
              ne(accounts.id, current.id)
            )
          );
        const [row] = await tx
          .update(accounts)
          .set({
            isPrimary: true,
            ...(body.nickname !== undefined ? { nickname: body.nickname } : {}),
            ...(body.status !== undefined ? { status: body.status } : {}),
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, current.id))
          .returning();
        return row;
      });
      return ok(updated);
    }

    // Plain rename / freeze / unfreeze.
    const patch: Partial<typeof accounts.$inferInsert> = { updatedAt: new Date() };
    if (body.nickname !== undefined) patch.nickname = body.nickname;
    if (body.goalAmount !== undefined) patch.goalAmount = body.goalAmount;
    if (body.status !== undefined) patch.status = body.status;

    const [row] = await db
      .update(accounts)
      .set(patch)
      .where(eq(accounts.id, current.id))
      .returning();
    return ok(row);
  },
});

export const DELETE = apiHandler({
  handler: async ({ user, params }) => {
    let current: typeof accounts.$inferSelect;
    try {
      current = await assertAccountOwnership(params.id, user.id);
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
      return err(
        "Account has active cards. Cancel or reassign them before closing.",
        409
      );
    }

    const [row] = await db
      .update(accounts)
      .set({
        status: "closed",
        isPrimary: false,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, current.id))
      .returning();

    // If we just closed the primary, promote the next-oldest open account.
    if (current.isPrimary) {
      await db
        .update(accounts)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(
          eq(
            accounts.id,
            sql`(select id from ${accounts}
                 where user_id = ${user.id}
                 and status <> 'closed'
                 order by created_at asc limit 1)`
          )
        );
    }

    return ok(row);
  },
});
