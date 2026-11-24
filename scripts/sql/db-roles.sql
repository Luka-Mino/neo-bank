-- Database roles for row-level security (PRE-DAKOTA-PLAN.md C1, migration 0021).
--
-- Run ONCE per environment, as the database owner, BEFORE applying 0021.
-- In Supabase: SQL editor (runs as postgres). Replace both passwords first,
-- using long random values from a password manager. Never commit them.
--
--   moneta_app     what the app uses for requests (DATABASE_URL).
--                  Row-level security applies: protected tables show only
--                  the org set by withOrg().
--   moneta_system  trusted background work (SYSTEM_DATABASE_URL): Dakota
--                  webhooks and reconcile, provisioning, crons, account
--                  deletion and export. BYPASSRLS. Only the files allowlisted
--                  in scripts/check-db-access.mjs may use it.
--
-- Migrations keep using the owner connection (drizzle-kit reads DATABASE_URL;
-- run them with DATABASE_URL set to the owner URL, not moneta_app).
--
-- If creating a BYPASSRLS role is refused (it needs a role that itself has
-- BYPASSRLS), check the owner role:
--   SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user;
-- If the owner has rolbypassrls = true, you may skip moneta_system and use the
-- owner connection string as SYSTEM_DATABASE_URL.

-- ─── App role: no bypass ─────────────────────────────────────────────────────
CREATE ROLE moneta_app LOGIN PASSWORD 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD'
  NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOINHERIT;

GRANT USAGE ON SCHEMA public TO moneta_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO moneta_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO moneta_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO moneta_app;
-- Tables created by later migrations (run as the owner) get the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO moneta_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO moneta_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO moneta_app;
-- The audit log is append-only (trigger in 0009); don't even grant the verbs.
REVOKE UPDATE, DELETE ON audit_log FROM moneta_app;

-- ─── System role: bypasses row-level security ────────────────────────────────
CREATE ROLE moneta_system LOGIN PASSWORD 'REPLACE_WITH_A_DIFFERENT_LONG_RANDOM_PASSWORD'
  NOSUPERUSER BYPASSRLS NOCREATEDB NOCREATEROLE NOINHERIT;

GRANT USAGE ON SCHEMA public TO moneta_system;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO moneta_system;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO moneta_system;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO moneta_system;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO moneta_system;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO moneta_system;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO moneta_system;
REVOKE UPDATE, DELETE ON audit_log FROM moneta_system;

-- ─── Check ───────────────────────────────────────────────────────────────────
-- Expect: moneta_app f f · moneta_system f t
SELECT rolname, rolsuper, rolbypassrls FROM pg_roles
 WHERE rolname IN ('moneta_app', 'moneta_system') ORDER BY rolname;

-- Supabase pooler: log in as "moneta_app.<project-ref>" (and
-- "moneta_system.<project-ref>") in the pooler connection string.
