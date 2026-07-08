-- Post-KYC provisioning state: the user's "self" recipient and crypto
-- destination (their own wallet address) used as the onramp deposit target.
-- See src/lib/dakota/provisioning.ts.
ALTER TABLE "dakota_customers" ADD COLUMN "self_recipient_id" text;--> statement-breakpoint
ALTER TABLE "dakota_customers" ADD COLUMN "self_destination_id" text;
