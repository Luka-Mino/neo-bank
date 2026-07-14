// Recurring internal transfers.
// GET  → the caller's rules (with account labels)
// POST → create a rule; first run is one period from now unless startDate
import { z } from "zod";
import { alias } from "drizzle-orm/pg-core";
import { and, eq, ne } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { accounts, recurringTransfers } from "@/lib/db/schema";
import { addPeriod, type Frequency } from "@/lib/transfers";
import { assertAccountOwnership, ownershipErr } from "@/lib/auth/ownership";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const fromAcc = alias(accounts, "from_acc");
    const toAcc = alias(accounts, "to_acc");
    const rules = await db
      .select({
        id: recurringTransfers.id,
        amount: recurringTransfers.amount,
        note: recurringTransfers.note,
        frequency: recurringTransfers.frequency,
        nextRunAt: recurringTransfers.nextRunAt,
        lastRunAt: recurringTransfers.lastRunAt,
        status: recurringTransfers.status,
        fromAccountId: recurringTransfers.fromAccountId,
        toAccountId: recurringTransfers.toAccountId,
        fromLabel: fromAcc.nickname,
        fromType: fromAcc.accountType,
        toLabel: toAcc.nickname,
        toType: toAcc.accountType,
      })
      .from(recurringTransfers)
      .innerJoin(fromAcc, eq(recurringTransfers.fromAccountId, fromAcc.id))
      .innerJoin(toAcc, eq(recurringTransfers.toAccountId, toAcc.id))
      .where(
        and(
          eq(recurringTransfers.userId, user.id),
          ne(recurringTransfers.status, "cancelled")
        )
      );
    return ok({ data: rules });
  },
});

const createSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  note: z.string().trim().max(120).optional(),
  startDate: z.string().datetime().optional(),
});

export const POST = apiHandler({
  schema: createSchema,
  rateLimit: { limit: 30, window: "1h" },
  handler: async ({ user, body }) => {
    if (body.fromAccountId === body.toAccountId) {
      return err("Choose two different accounts", 400);
    }
    try {
      await Promise.all([
        assertAccountOwnership(body.fromAccountId, user.id),
        assertAccountOwnership(body.toAccountId, user.id),
      ]);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    const nextRunAt = body.startDate
      ? new Date(body.startDate)
      : addPeriod(new Date(), body.frequency as Frequency);
    if (nextRunAt.getTime() < Date.now() - 60_000) {
      return err("Start date is in the past", 400);
    }

    const [rule] = await db
      .insert(recurringTransfers)
      .values({
        userId: user.id,
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amount: body.amount,
        note: body.note,
        frequency: body.frequency,
        nextRunAt,
      })
      .returning();
    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "recurring_transfer_created",
      resourceType: "recurring_transfer",
      resourceId: rule.id,
      metadata: { fromAccountId: body.fromAccountId, toAccountId: body.toAccountId, amount: body.amount, frequency: body.frequency },
    });
    return ok(rule, 201);
  },
});
