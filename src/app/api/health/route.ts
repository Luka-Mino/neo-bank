// GET /api/health — readiness probe. Reports DB reachability and basic
// service state. Public but leaks nothing sensitive; used by uptime checks
// and deploy gates.
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    await db.execute(sql`select 1`);
    checks.database = "ok";
  } catch {
    checks.database = "fail";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
