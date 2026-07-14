ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_otp_enabled" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "email_otp_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "code_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "attempts" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_email_otp_user" ON "email_otp_codes" ("user_id");
