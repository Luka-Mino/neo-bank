-- One-time 2FA recovery codes (see src/lib/auth/backup-codes.ts). Stored as a
-- keyed HMAC, single-use via used_at. Guards against authenticator-loss lockout.
CREATE TABLE IF NOT EXISTS "two_factor_backup_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "code_hash" text NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_2fa_backup_user" ON "two_factor_backup_codes" ("user_id");
