-- Reconciliation sync state: tiny KV holding the GET /events sweep cursor
-- (high-water event KSUID). See src/lib/dakota/reconcile.ts.
CREATE TABLE IF NOT EXISTS "dakota_sync_state" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
