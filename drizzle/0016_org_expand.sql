-- Phase 0, migration 1 of 3: EXPAND (pure-additive, safe to ship alone).
-- Creates the org-tenancy tables + adds nullable org_id to every class-A table.
-- Nothing reads org_id yet. Backfill in 0017, enforce (NOT NULL + FK + RLS) in
-- 0018. See ORG-FOUNDATION-SPEC.md.

-- ── Asset registry (referenced by accounts.asset, approval_* — model only) ───
CREATE TABLE IF NOT EXISTS "assets" (
  "code"               text PRIMARY KEY NOT NULL,
  "name"               text NOT NULL,
  "kind"               text NOT NULL,
  "decimals"           smallint NOT NULL DEFAULT 2,
  "default_network_id" text,
  "enabled"            boolean NOT NULL DEFAULT true
);
INSERT INTO "assets" ("code","name","kind","decimals","enabled") VALUES
  ('USD','US Dollar','fiat',2,true),
  ('EUR','Euro','fiat',2,false),
  ('GBP','British Pound','fiat',2,false),
  ('USDC','USD Coin','stablecoin',6,true),
  ('EURC','Euro Coin','stablecoin',6,false)
ON CONFLICT ("code") DO NOTHING;

-- ── Organizations (the tenant) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "organizations" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"                 text NOT NULL,
  "slug"                 text,
  "type"                 text NOT NULL DEFAULT 'personal',
  "status"               text NOT NULL DEFAULT 'active',
  "created_by"           uuid REFERENCES "users"("id") ON DELETE restrict,
  "personal_for_user_id" uuid UNIQUE REFERENCES "users"("id") ON DELETE restrict,
  "settings"             jsonb,
  "created_at"           timestamptz NOT NULL DEFAULT now(),
  "updated_at"           timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_orgs_slug" ON "organizations" ("slug") WHERE "slug" IS NOT NULL;

-- users.active_org_id — server-side current-org pointer (FK added here, no cycle in SQL)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active_org_id" uuid REFERENCES "organizations"("id");

-- ── Membership + role ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "org_members" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id"      uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "user_id"     uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role"        text NOT NULL DEFAULT 'member',
  "can_approve" boolean NOT NULL DEFAULT false,
  "status"      text NOT NULL DEFAULT 'active',
  "invited_by"  uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at"  timestamptz NOT NULL DEFAULT now(),
  "updated_at"  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_members_unique" ON "org_members" ("org_id","user_id");
CREATE INDEX IF NOT EXISTS "idx_org_members_user" ON "org_members" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_org_members_org"  ON "org_members" ("org_id","status");

-- ── Invitations (single-use hashed token) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "org_invitations" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id"              uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "email"               text NOT NULL,
  "role"                text NOT NULL DEFAULT 'member',
  "can_approve"         boolean NOT NULL DEFAULT false,
  "token_hash"          text NOT NULL UNIQUE,
  "invited_by"          uuid REFERENCES "users"("id") ON DELETE cascade,
  "status"              text NOT NULL DEFAULT 'pending',
  "expires_at"          timestamptz NOT NULL,
  "accepted_at"         timestamptz,
  "accepted_by_user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "created_at"          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_org_invitations_org" ON "org_invitations" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_org_invitations_email" ON "org_invitations" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_invitations_pending"
  ON "org_invitations" ("org_id", lower("email")) WHERE "status" = 'pending';

-- ── Approval policies / requests / decisions (inert scaffold, enabled=false) ─
CREATE TABLE IF NOT EXISTS "approval_policies" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id"             uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "action_type"        text NOT NULL,
  "threshold_amount"   numeric(30,18),
  "threshold_asset"    text NOT NULL DEFAULT 'USD' REFERENCES "assets"("code"),
  "required_approvals" smallint NOT NULL DEFAULT 1,
  "enabled"            boolean NOT NULL DEFAULT false,
  "created_at"         timestamptz NOT NULL DEFAULT now(),
  "updated_at"         timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_approval_policies_unique"
  ON "approval_policies" ("org_id","action_type","threshold_asset");

CREATE TABLE IF NOT EXISTS "approval_requests" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id"             uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "action_type"        text NOT NULL,
  "payload"            jsonb NOT NULL,
  "payload_hash"       text NOT NULL,
  "amount"             numeric(30,18),
  "asset"              text REFERENCES "assets"("code"),
  "status"             text NOT NULL DEFAULT 'pending',
  "required_approvals" smallint NOT NULL DEFAULT 1,
  "approvals_count"    smallint NOT NULL DEFAULT 0,
  "requested_by"       uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "executed_tx_id"     uuid REFERENCES "transactions"("id") ON DELETE set null,
  "expires_at"         timestamptz,
  "decided_at"         timestamptz,
  "executed_at"        timestamptz,
  "created_at"         timestamptz NOT NULL DEFAULT now(),
  "updated_at"         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_approval_requests_org" ON "approval_requests" ("org_id","status");

CREATE TABLE IF NOT EXISTS "approval_decisions" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id"  uuid NOT NULL REFERENCES "approval_requests"("id") ON DELETE cascade,
  "approver_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "decision"    text NOT NULL,
  "comment"     text,
  "created_at"  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_approval_decisions_unique"
  ON "approval_decisions" ("request_id","approver_id");

-- ── Nullable org_id on every class-A table (+ audit_log) + accounts.asset ────
ALTER TABLE "dakota_customers"          ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "wallets"                   ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "wallet_balances"           ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "dakota_rails"              ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "accounts"                  ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "accounts"                  ADD COLUMN IF NOT EXISTS "asset" text NOT NULL DEFAULT 'USDC';
ALTER TABLE "cards"                     ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "transactions"              ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "recipients"                ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "destinations"              ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "recurring_transfers"       ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "transaction_status_history" ADD COLUMN IF NOT EXISTS "org_id" uuid;
ALTER TABLE "audit_log"                 ADD COLUMN IF NOT EXISTS "org_id" uuid;
