import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For serverless (Vercel), use connection pooling
const client = postgres(connectionString, {
  prepare: false, // Required for Supabase Transaction mode pooler
});

export const db = drizzle(client, { schema });
