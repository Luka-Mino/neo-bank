-- 0022_side_accounts — SIDE-ACCOUNTS-PLAN.md Phase 1. Additive.
--
-- Each Moneta account can hold its money in its own Dakota wallet:
--   - the MAIN account uses the org's main wallet (created at onboarding);
--   - each SIDE account gets its own wallet (when SIDE_ACCOUNT_WALLETS=dakota).
-- accounts.wallet_id NULL means "the org's main wallet" (every account
-- before this migration, and all accounts while side wallets are off).

-- Which wallet is the org's main one. Existing wallets are all main wallets.
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "purpose" text NOT NULL DEFAULT 'main';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_purpose_check') THEN
    ALTER TABLE "wallets" ADD CONSTRAINT "wallets_purpose_check" CHECK ("purpose" IN ('main', 'side'));
  END IF;
END $$;
-- At most one main wallet per org.
CREATE UNIQUE INDEX IF NOT EXISTS "wallets_one_main_per_org" ON "wallets" ("org_id") WHERE "purpose" = 'main';

-- Where an account's money lives. Same-org composite FK (as in 0021), so an
-- account can never point at another org's wallet; one account per wallet.
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "wallet_id" uuid;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_org_wallet_fk') THEN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_org_wallet_fk"
      FOREIGN KEY ("org_id", "wallet_id") REFERENCES "wallets" ("org_id", "id") ON DELETE RESTRICT;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_one_per_wallet" ON "accounts" ("wallet_id") WHERE "wallet_id" IS NOT NULL;
