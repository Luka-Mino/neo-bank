// Operational alerts for conditions a human should see: dead-lettered
// webhooks, stuck transactions, reconciliation failures. Today it logs at
// error level (surfaced by log-based alerting) and forwards to Sentry when a
// DSN exists. The email/Slack channel plugs in here later without changing
// call sites.

import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

export type OpsAlert =
  | "webhook_dead_letter"
  | "transaction_stuck"
  | "reconcile_failed"
  | "ledger_drift";

export async function alertOps(
  alert: OpsAlert,
  context: Record<string, unknown>
): Promise<void> {
  logger.error(`ops.alert.${alert}`, context);
  try {
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(`ops.alert.${alert}`, {
        level: "error",
        extra: context,
      });
    }
  } catch {
    // Alerting must never throw into the caller's path.
  }
}
