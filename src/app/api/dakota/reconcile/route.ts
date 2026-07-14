import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { reconcileEvents } from "@/lib/dakota/reconcile";

/**
 * Triggers an events reconciliation pass (see src/lib/dakota/reconcile.ts).
 * Meant for a scheduler (Vercel cron sends GET with the CRON_SECRET bearer)
 * or manual ops use. In production CRON_SECRET is mandatory; in dev the
 * route is open so `npm run dakota:reconcile` and local testing work.
 */
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
  try {
    const result = await reconcileEvents();
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Reconciliation failed:", { detail: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
