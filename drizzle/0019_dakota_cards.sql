-- Dakota Cards groundwork (see DAKOTA-CARDS-SPEC.md, CARD-ISSUING-PLAN.md).
-- Additive and backward compatible; safe to ship before Cards is switched on.

-- Dakota creates cards as `pending` with last4 = null and fills it in on the
-- activation webhook, so last4 can no longer be required.
ALTER TABLE "cards" ALTER COLUMN "last4" DROP NOT NULL;

-- Dakota's card `version` (+1 on every change). Webhooks can arrive out of
-- order; we only apply an event whose version is greater than this one.
ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "issuer_version" integer;

-- The customer's Dakota cardholder (one per individual customer).
ALTER TABLE "dakota_customers" ADD COLUMN IF NOT EXISTS "dakota_cardholder_id" text;
