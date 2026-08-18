-- Phase 0, migration 2 of 3: BACKFILL (idempotent — every step guarded by
-- NOT EXISTS / IS NULL, so it's safe to re-run). Gives every existing user a
-- personal org they own and stamps org_id on all their existing rows. The
-- personal_for_user_id UNIQUE column makes the 1:1 mapping deterministic.
-- See ORG-FOUNDATION-SPEC.md.

-- (a) one personal org per user, INCLUDING soft-deleted (they own retained AML records)
INSERT INTO "organizations" ("name","type","status","created_by","personal_for_user_id")
SELECT COALESCE(NULLIF(u."full_name",''),'Personal') || ' (Personal)', 'personal', 'active', u."id", u."id"
FROM "users" u
WHERE NOT EXISTS (SELECT 1 FROM "organizations" o WHERE o."personal_for_user_id" = u."id");
--> statement-breakpoint

-- (b) owner membership, approver-capable
INSERT INTO "org_members" ("org_id","user_id","role","can_approve","status")
SELECT o."id", o."personal_for_user_id", 'owner', true, 'active'
FROM "organizations" o
WHERE o."personal_for_user_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "org_members" m WHERE m."org_id"=o."id" AND m."user_id"=o."personal_for_user_id");
--> statement-breakpoint

-- (c) point each user at their personal org
UPDATE "users" u SET "active_org_id" = o."id"
FROM "organizations" o WHERE o."personal_for_user_id" = u."id" AND u."active_org_id" IS NULL;
--> statement-breakpoint

-- (d) stamp org_id on every DIRECT class-A table via the unique personal org
UPDATE "accounts" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "dakota_customers" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "wallets" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "dakota_rails" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "cards" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "transactions" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "recipients" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
UPDATE "recurring_transfers" t SET "org_id"=o."id"
  FROM "organizations" o WHERE o."personal_for_user_id"=t."user_id" AND t."org_id" IS NULL;
--> statement-breakpoint

-- (e) stamp INDIRECT tables from their parent's org_id
UPDATE "destinations" d SET "org_id"=r."org_id"
  FROM "recipients" r WHERE r."id"=d."recipient_id" AND d."org_id" IS NULL;
UPDATE "wallet_balances" wb SET "org_id"=w."org_id"
  FROM "wallets" w WHERE w."id"=wb."wallet_id" AND wb."org_id" IS NULL;
UPDATE "transaction_status_history" h SET "org_id"=t."org_id"
  FROM "transactions" t WHERE t."id"=h."transaction_id" AND h."org_id" IS NULL;
--> statement-breakpoint

-- (f) seed default approval policy per org, DISABLED (inert scaffold)
INSERT INTO "approval_policies" ("org_id","action_type","threshold_amount","threshold_asset","required_approvals","enabled")
SELECT o."id",'transfer.external', NULL, 'USD', 1, false FROM "organizations" o
WHERE NOT EXISTS (SELECT 1 FROM "approval_policies" p WHERE p."org_id"=o."id" AND p."action_type"='transfer.external');
