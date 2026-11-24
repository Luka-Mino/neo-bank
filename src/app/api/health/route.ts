// GET /api/health — readiness probe. Reports DB reachability and basic
// service state. Public but leaks nothing sensitive; used by uptime checks
// and deploy gates.
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, systemDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function bypasses(conn: typeof db): Promise<boolean> {
  const [r] = (await conn.execute(
    sql`select (rolsuper or rolbypassrls) as bypass from pg_roles where rolname = current_user`
  )) as unknown as { bypass: boolean }[];
  return r?.bypass === true;
}

async function databaseRolesOk(): Promise<boolean> {
  try {
    return !(await bypasses(db)) && (await bypasses(systemDb));
  } catch {
    return false;
  }
}

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    await db.execute(sql`select 1`);
    checks.database = "ok";
  } catch {
    checks.database = "fail";
  }

  // Row-level security posture (migration 0021). The app connection must NOT
  // bypass RLS, and the system connection (webhooks, crons) MUST, or system
  // jobs see nothing. Counted toward health in production only: local dev
  // usually runs as a superuser on purpose.
  const roles = await databaseRolesOk();
  if (process.env.NODE_ENV === "production") checks.databaseRoles = roles ? "ok" : "fail";

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
