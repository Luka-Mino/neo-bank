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
