-- Issuer card reference for real card issuing (Stripe `ic_...`). Null for
-- mock-issued cards. Indexed because the authorization webhook maps every
-- incoming swipe back to our card by this id on the hot path.
ALTER TABLE "cards" ADD COLUMN "external_card_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cards_external_id" ON "cards" ("external_card_id");
