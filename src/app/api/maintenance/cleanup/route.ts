// GET/POST /api/maintenance/cleanup — scheduled data retention.
// Purges expired/consumed short-lived tokens and ages out processed webhook
// events, so those tables don't grow unbounded and stale credentials don't
// linger. CRON_SECRET-gated (Vercel cron sends the bearer); open in dev.
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, isNotNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  magicLinkTokens,
  passwordResetTokens,
  emailVerificationTokens,
  webhookEvents,
} from "@/lib/db/schema";
import { logger } from "@/lib/logger";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const given = Buffer.from(req.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
  }
  return process.env.NODE_ENV !== "production";
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const result: Record<string, number> = {};

  // Magic-link tokens: expired or already used.
  const ml = await db
    .delete(magicLinkTokens)
    .where(or(lt(magicLinkTokens.expiresAt, now), isNotNull(magicLinkTokens.usedAt)))
    .returning({ id: magicLinkTokens.id });
  result.magicLinkTokens = ml.length;

  // Password-reset tokens: expired or used.
  const pr = await db
    .delete(passwordResetTokens)
    .where(
      or(lt(passwordResetTokens.expiresAt, now), isNotNull(passwordResetTokens.usedAt))
    )
    .returning({ id: passwordResetTokens.id });
  result.passwordResetTokens = pr.length;

  // Email-verification tokens: verified, or expired more than a day ago.
  const ev = await db
    .delete(emailVerificationTokens)
    .where(
      or(
        isNotNull(emailVerificationTokens.verifiedAt),
        lt(emailVerificationTokens.expiresAt, dayAgo)
      )
    )
    .returning({ id: emailVerificationTokens.id });
  result.emailVerificationTokens = ev.length;

  // Processed webhook events older than 90 days (keep unprocessed/dead-letter
  // for investigation regardless of age).
  const we = await db
    .delete(webhookEvents)
    .where(
      and(
        isNotNull(webhookEvents.processedAt),
        lt(webhookEvents.createdAt, ninetyDaysAgo)
      )
    )
    .returning({ id: webhookEvents.id });
  result.webhookEvents = we.length;

  logger.info("maintenance.cleanup", result);
  return NextResponse.json({ purged: result, time: now.toISOString() });
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}

