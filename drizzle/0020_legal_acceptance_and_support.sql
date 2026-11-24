-- LAUNCH-READINESS-PLAN 1c.2 and 1c.3. Additive and backward compatible.

-- 1c.2: which version of Moneta's own Terms and Privacy policy the user
-- accepted at sign-up, and when. Dakota records acceptance of its own
-- documents on its hosted onboarding form; these columns cover only ours.
-- Users created before this migration have NULLs.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_version" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacy_version" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "legal_accepted_at" timestamp with time zone;

-- 1c.3: support requests and complaints. Support sits with Moneta under
-- Dakota's model ("your team owns the customer relationship ... support"),
-- and card disputes reach us first, before we report them to Dakota.
CREATE TABLE IF NOT EXISTS "support_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reference" text NOT NULL UNIQUE,
  "org_id" uuid REFERENCES "organizations"("id") ON DELETE SET NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "transaction_id" uuid,
  "status" text NOT NULL DEFAULT 'open',
  "forwarded_to" text,
  "forwarded_at" timestamp with time zone,
  "external_reference" text,
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "support_requests_category_check"
    CHECK ("category" IN ('question', 'complaint', 'card_dispute', 'fraud')),
  CONSTRAINT "support_requests_status_check"
    CHECK ("status" IN ('open', 'in_progress', 'forwarded', 'resolved'))
);

CREATE INDEX IF NOT EXISTS "idx_support_requests_user" ON "support_requests" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_support_requests_open" ON "support_requests" ("status") WHERE "status" <> 'resolved';
