-- Team-layer P0 fixes (see TEAM-RBAC-PLAN.md). Additive + a constraint swap;
-- safe to ship independently of the RLS enforce migration.

-- Capability flags (orthogonal to role rank). Default true so existing members
-- (owners of personal orgs) keep full authority; the Accountant persona sets
-- can_move_money=false at invite/edit time.
ALTER TABLE "org_members"     ADD COLUMN IF NOT EXISTS "can_move_money" boolean NOT NULL DEFAULT true;
ALTER TABLE "org_members"     ADD COLUMN IF NOT EXISTS "can_export"     boolean NOT NULL DEFAULT true;
ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "can_move_money" boolean NOT NULL DEFAULT true;
ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "can_export"     boolean NOT NULL DEFAULT true;

-- Tiered approval thresholds: allow multiple bands per (org, action, asset) by
-- adding threshold_amount to the unique key. NULLS NOT DISTINCT keeps exactly
-- one "always require" (NULL-threshold) policy per action/asset.
DROP INDEX IF EXISTS "idx_approval_policies_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "idx_approval_policies_unique"
  ON "approval_policies" ("org_id","action_type","threshold_asset","threshold_amount")
  NULLS NOT DISTINCT;
