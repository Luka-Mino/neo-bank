// GET    /api/accounts/[id]  → fetch one of the org's accounts
// PATCH  /api/accounts/[id]  → rename, freeze/activate, or set as primary
// DELETE /api/accounts/[id]  → soft-close (status = 'closed')

import { and, eq, ne, sql } from "drizzle-orm";
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

    // setPrimary requires demoting the org's existing primary. The whole
    // handler already runs inside the withOrg transaction, so these two writes
    // are atomic without a nested transaction.
    if (body.setPrimary === true && !current.isPrimary) {
      await db
        .update(accounts)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(accounts.orgId, user.orgId!),
            eq(accounts.isPrimary, true),
            ne(accounts.id, current.id)
          )
        );
      const [updated] = await db
        .update(accounts)
        .set({
          isPrimary: true,
          ...(body.nickname !== undefined ? { nickname: body.nickname } : {}),
          ...(body.status !== undefined ? { status: body.status } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(accounts.id, current.id), eq(accounts.orgId, user.orgId!)))
        .returning();
      await logAudit({
        actorType: "user",
        actorId: user.id,
        action: "account_updated",
        resourceType: "account",
        resourceId: current.id,
        metadata: { nickname: body.nickname, status: body.status, setPrimary: body.setPrimary, goalAmount: body.goalAmount },
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
      .where(and(eq(accounts.id, current.id), eq(accounts.orgId, user.orgId!)))
      .returning();

    // If we just closed the primary, promote the next-oldest open org account.
    if (current.isPrimary) {
      await db
        .update(accounts)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(
          eq(
            accounts.id,
            sql`(select id from ${accounts}
                 where org_id = ${user.orgId!}
                 and status <> 'closed'
                 order by created_at asc limit 1)`
          )
        );
    }

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
