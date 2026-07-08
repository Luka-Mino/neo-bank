-- Multi-account model: per-user accounts (checking/savings/etc.) and cards.
-- Renames dakota_accounts → dakota_rails to free the "accounts" namespace
-- for the user-facing concept. account_id added to transactions (nullable
-- during backfill window).
--
-- This migration is non-destructive. The 0002 backfill follows.

ALTER TABLE "dakota_accounts" RENAME TO "dakota_rails";--> statement-breakpoint
ALTER INDEX "idx_dakota_accounts_user" RENAME TO "idx_dakota_rails_user";--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "account_type" text NOT NULL,
  "nickname" text,
  "account_number" text NOT NULL,
  "currency" text DEFAULT 'USD' NOT NULL,
  "balance" numeric(30, 18) DEFAULT '0' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "accounts_account_number_unique" UNIQUE("account_number"),
  CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_accounts_user" ON "accounts" USING btree ("user_id");--> statement-breakpoint

-- Exactly one primary per user across open accounts. Closed accounts may
-- retain is_primary=false without conflict; a new primary can be set after
-- closing the previous one.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_accounts_one_primary_per_user"
  ON "accounts" USING btree ("user_id")
  WHERE "is_primary" = true AND "status" <> 'closed';--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "cards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "account_id" uuid NOT NULL,
  "card_type" text NOT NULL,
  "last4" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "nickname" text,
  "exp_month" smallint,
  "exp_year" smallint,
  "network" text,
  "pan_token" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "cards_account_id_accounts_id_fk" FOREIGN KEY ("account_id")
    REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_cards_user" ON "cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cards_account" ON "cards" USING btree ("account_id");--> statement-breakpoint

ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "account_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_transactions_account" ON "transactions" USING btree ("account_id");
