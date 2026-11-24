import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Serverless-tuned pool. Each Vercel function instance holds its own small
// pool; keep max low so many concurrent instances don't exhaust the Supabase
// pooler's connection budget. idle_timeout reaps connections between bursts;
// connect_timeout fails fast instead of hanging a request.
const client = postgres(connectionString, {
  prepare: false, // Required for Supabase Transaction mode pooler
  max: Number(process.env.DB_POOL_MAX ?? 5),
  idle_timeout: 20, // seconds
  connect_timeout: 10, // seconds
});

export const db = drizzle(client, { schema });

// ─── System connection (row-level security bypass) ───────────────────────────
// `db` connects as the app role (`moneta_app`): row-level security applies, so
// protected (class-A) tables only show rows inside `withOrg(orgId, ...)`.
//
// `systemDb` connects as a role with BYPASSRLS (`SYSTEM_DATABASE_URL`). It is
// for trusted background work that has no single signed-in org: Dakota
// webhooks and reconcile, provisioning, crons that scan every org, account
// deletion and data export, and system-wide checks. Only the files allowlisted
// in `scripts/check-db-access.mjs` may import it. That check runs in CI.
//
// When SYSTEM_DATABASE_URL is unset (local dev, where the dev user is usually a
// superuser), it shares the app connection. In production that means system
// jobs fail closed (they see nothing) instead of silently bypassing; /api/health
// reports the misconfiguration. See docs in PRE-DAKOTA-PLAN.md C1.
const systemConnectionString = process.env.SYSTEM_DATABASE_URL;

export const systemDb = systemConnectionString
  ? drizzle(
      postgres(systemConnectionString, {
        prepare: false,
        max: Number(process.env.DB_SYSTEM_POOL_MAX ?? 2),
        idle_timeout: 20,
        connect_timeout: 10,
      }),
      { schema }
    )
  : db;
