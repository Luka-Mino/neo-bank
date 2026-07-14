-- Indexes for hot read paths that lacked them.
CREATE INDEX IF NOT EXISTS "idx_audit_log_actor" ON "audit_log" ("actor_id");
CREATE INDEX IF NOT EXISTS "idx_audit_log_created" ON "audit_log" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_webhook_events_unprocessed"
  ON "webhook_events" ("created_at") WHERE "processed_at" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
  ON "notifications" ("user_id") WHERE "read_at" IS NULL;
