// POST/GET /api/transfers/recurring/run — the due-date sweep.
// Same auth as the reconcile cron: CRON_SECRET bearer in production, open
// in dev (trigger manually while testing).
//
// Exactly-once-per-period: each rule is CLAIMED first — an atomic UPDATE
// advances next_run_at only if it is still due — and executed after. Two
// racing sweeps can't both claim; a crash between claim and execution skips
// one period rather than ever double-moving money.
import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, recurringTransfers } from "@/lib/db/schema";
import {
  addPeriod,
  INSUFFICIENT_FUNDS,
  performInternalTransfer,
  type Frequency,
} from "@/lib/transfers";
import { createNotification } from "@/lib/notifications";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const given = Buffer.from(req.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
  }
  return process.env.NODE_ENV !== "production";
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db
    .select()
    .from(recurringTransfers)
    .where(
      and(
        eq(recurringTransfers.status, "active"),
        lte(recurringTransfers.nextRunAt, now)
      )
    )
    .limit(200);

  let executed = 0;
  let skipped = 0;

  for (const rule of due) {
    // Claim: advance the schedule only if still due — the atomic gate.
    const nextRunAt = addPeriod(rule.nextRunAt, rule.frequency as Frequency);
    const claimed = await db
      .update(recurringTransfers)
      .set({ nextRunAt, lastRunAt: now, updatedAt: now })
      .where(
        and(
          eq(recurringTransfers.id, rule.id),
          eq(recurringTransfers.status, "active"),
          lte(recurringTransfers.nextRunAt, now),
          // guard against a racing sweep having already advanced it
          eq(recurringTransfers.nextRunAt, rule.nextRunAt)
        )
      )
      .returning({ id: recurringTransfers.id });
    if (claimed.length === 0) continue; // another sweep won

    try {
      const [from] = await db
        .select({ currency: accounts.currency, status: accounts.status })
        .from(accounts)
        .where(eq(accounts.id, rule.fromAccountId))
        .limit(1);
      if (!from || from.status !== "active") throw new Error(INSUFFICIENT_FUNDS);

      await performInternalTransfer({
        userId: rule.userId,
        fromAccountId: rule.fromAccountId,
        toAccountId: rule.toAccountId,
        amount: rule.amount,
        note: rule.note ?? `Recurring ${rule.frequency} transfer`,
        currency: from.currency,
      });
      executed++;
    } catch (e) {
      skipped++;
      const insufficient =
        e instanceof Error && e.message === INSUFFICIENT_FUNDS;
      await createNotification({
        userId: rule.userId,
        type: "transaction_update",
        title: "Recurring transfer skipped",
        body: insufficient
          ? `Your ${rule.frequency} transfer of $${rule.amount} was skipped — not enough balance in the source account. It will try again next period.`
          : `Your ${rule.frequency} transfer of $${rule.amount} could not be executed this period.`,
        actionUrl: "/transfer-internal",
      });
      if (!insufficient) {
        logger.error(`Recurring rule ${rule.id} execution error:`, { detail: e instanceof Error ? e.message : String(e) })
      }
    }
  }

  return NextResponse.json({ due: due.length, executed, skipped });
}

export async function POST(req: NextRequest) {
  return handle(req);
}
export async function GET(req: NextRequest) {
  return handle(req);
}
