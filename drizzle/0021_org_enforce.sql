-- 0021_org_enforce — the "enforce" step of ORG-FOUNDATION-SPEC.md (plan C1).
--
-- After this migration the database itself keeps each org's money data apart:
--   1. org_id is NOT NULL on the 11 class-A tables, with a real FK to
--      organizations (0016 added the columns without one).
--   2. Composite FKs: a child row must belong to the same org as its parent,
--      so no row can point at another org's row.
--   3. Constraint swaps: one primary account per ORG; one Dakota customer per
--      org (user_id stays unique too until business onboarding, plan 1c.8).
--   4. Row-level security, ENABLE + FORCE, on all 11 tables. A row is visible
--      only when app.current_org_id (set by withOrg) matches its org_id.
--      Unset → no rows (fail closed).
--
-- DEPLOY ORDER (see PRE-DAKOTA-PLAN.md C1 and scripts/sql/db-roles.sql):
--   a. Create the roles: moneta_app (no bypass) and a BYPASSRLS role for
--      SYSTEM_DATABASE_URL.
--   b. Set DATABASE_URL = moneta_app and SYSTEM_DATABASE_URL = the bypass role
--      in Vercel; deploy the code that uses them.
--   c. Apply this migration with the owner connection.
-- Superusers and BYPASSRLS roles are not restricted by RLS, so local dev with a
-- superuser keeps working; tests run as moneta_app to prove the policies.

-- ─── 0. Pre-flight: refuse to run on data that would break the rules ──────────
DO $$
DECLARE
  t text;
  n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'dakota_customers','wallets','dakota_rails','accounts','cards','transactions',
    'recipients','recurring_transfers','destinations','wallet_balances',
    'transaction_status_history'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE org_id IS NULL', t) INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION '0021: % row(s) in % have NULL org_id. Run the 0017 backfill first.', n, t;
    END IF;
  END LOOP;

  SELECT count(*) INTO n FROM destinations d JOIN recipients r ON r.id = d.recipient_id
    WHERE d.org_id <> r.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % destination(s) in a different org from their recipient', n; END IF;

  SELECT count(*) INTO n FROM wallet_balances b JOIN wallets w ON w.id = b.wallet_id
    WHERE b.org_id <> w.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % wallet balance(s) in a different org from their wallet', n; END IF;

  SELECT count(*) INTO n FROM transaction_status_history h JOIN transactions x ON x.id = h.transaction_id
    WHERE h.org_id <> x.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % status-history row(s) in a different org from their transaction', n; END IF;

  SELECT count(*) INTO n FROM transactions x JOIN accounts a ON a.id = x.account_id
    WHERE x.org_id <> a.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % transaction(s) in a different org from their account', n; END IF;

  SELECT count(*) INTO n FROM cards c JOIN accounts a ON a.id = c.account_id
    WHERE c.org_id <> a.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % card(s) in a different org from their account', n; END IF;

  SELECT count(*) INTO n FROM recurring_transfers r
    JOIN accounts f ON f.id = r.from_account_id
    JOIN accounts t2 ON t2.id = r.to_account_id
    WHERE r.org_id <> f.org_id OR r.org_id <> t2.org_id;
  IF n > 0 THEN RAISE EXCEPTION '0021: % recurring transfer(s) span orgs', n; END IF;

  SELECT count(*) INTO n FROM (
    SELECT org_id FROM accounts WHERE is_primary AND status <> 'closed'
    GROUP BY org_id HAVING count(*) > 1
  ) dup;
  IF n > 0 THEN RAISE EXCEPTION '0021: % org(s) have more than one open primary account', n; END IF;

  SELECT count(*) INTO n FROM (
    SELECT org_id FROM dakota_customers GROUP BY org_id HAVING count(*) > 1
  ) dup;
  IF n > 0 THEN RAISE EXCEPTION '0021: % org(s) have more than one Dakota customer', n; END IF;
END $$;

-- ─── 1. org_id NOT NULL + FK to organizations ────────────────────────────────
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'dakota_customers','wallets','dakota_rails','accounts','cards','transactions',
    'recipients','recurring_transfers','destinations','wallet_balances',
    'transaction_status_history'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN org_id SET NOT NULL', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = t || '_org_id_organizations_id_fk'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT',
        t, t || '_org_id_organizations_id_fk'
      );
    END IF;
  END LOOP;
END $$;

-- accounts.asset → the assets registry (also planned for "0018", never shipped).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_asset_assets_code_fk') THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_asset_assets_code_fk
      FOREIGN KEY (asset) REFERENCES assets(code);
  END IF;
END $$;

-- ─── 2. Composite FKs: a child must be in its parent's org ───────────────────
CREATE UNIQUE INDEX IF NOT EXISTS accounts_org_id_id_unique ON accounts (org_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS recipients_org_id_id_unique ON recipients (org_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS wallets_org_id_id_unique ON wallets (org_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS transactions_org_id_id_unique ON transactions (org_id, id);

DO $$
DECLARE
  fk record;
BEGIN
  FOR fk IN SELECT * FROM (VALUES
    ('destinations', 'destinations_org_recipient_fk', 'org_id, recipient_id', 'recipients', 'CASCADE'),
    ('wallet_balances', 'wallet_balances_org_wallet_fk', 'org_id, wallet_id', 'wallets', 'CASCADE'),
    ('transaction_status_history', 'transaction_status_history_org_tx_fk', 'org_id, transaction_id', 'transactions', 'CASCADE'),
    ('transactions', 'transactions_org_account_fk', 'org_id, account_id', 'accounts', 'RESTRICT'),
    ('cards', 'cards_org_account_fk', 'org_id, account_id', 'accounts', 'RESTRICT'),
    ('recurring_transfers', 'recurring_transfers_org_from_account_fk', 'org_id, from_account_id', 'accounts', 'CASCADE'),
    ('recurring_transfers', 'recurring_transfers_org_to_account_fk', 'org_id, to_account_id', 'accounts', 'CASCADE')
  ) AS v(child, name, cols, parent, on_delete)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk.name) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%s) REFERENCES %I (org_id, id) ON DELETE %s',
        fk.child, fk.name, fk.cols, fk.parent, fk.on_delete
      );
    END IF;
  END LOOP;
END $$;

-- ─── 3. Constraint swaps ─────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_accounts_one_primary_per_user;
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_one_primary_per_org
  ON accounts (org_id) WHERE is_primary = true AND status <> 'closed';

CREATE UNIQUE INDEX IF NOT EXISTS dakota_customers_org_id_unique ON dakota_customers (org_id);

-- ─── 4. Row-level security ───────────────────────────────────────────────────
-- The org of the current request, set per transaction by withOrg():
--   set_config('app.current_org_id', <org>, is_local => true)
-- NULLIF guards the empty string a pooled connection reports after an earlier
-- transaction set the GUC locally; the cast would otherwise error.
CREATE OR REPLACE FUNCTION app_current_org_id() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('app.current_org_id', true), '')::uuid $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'dakota_customers','wallets','dakota_rails','accounts','cards','transactions',
    'recipients','recurring_transfers','destinations','wallet_balances',
    'transaction_status_history'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS org_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY org_isolation ON %I FOR ALL '
      'USING (org_id = app_current_org_id()) '
      'WITH CHECK (org_id = app_current_org_id())',
      t
    );
  END LOOP;
END $$;
