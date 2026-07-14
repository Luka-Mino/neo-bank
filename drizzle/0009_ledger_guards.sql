-- Money-safety invariants at the DB layer (defense in depth beneath the
-- application's optimistic locks). Non-negative account balances, and an
-- append-only audit log.

-- Balances can never go negative.
ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_balance_nonnegative" CHECK ("balance" >= 0);

-- Goal amounts, if set, must be positive.
ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_goal_positive"
  CHECK ("goal_amount" IS NULL OR "goal_amount" > 0);

-- Audit log is append-only: block UPDATE and DELETE via a trigger so the
-- trail is tamper-evident even to the application's own DB role.
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (% blocked)', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_update ON "audit_log";
CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
