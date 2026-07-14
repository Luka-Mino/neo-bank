-- Session revocation: token_version bumped to invalidate existing JWTs.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" integer DEFAULT 0 NOT NULL;
