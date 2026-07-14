import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { alertOps } from "@/lib/alerts";
import type { DakotaEventEnvelope } from "./webhooks";
import { handlers } from "./webhook-handlers";

export type ProcessOutcome =
  | "processed"
  | "ignored"
  | "already_processed"
  | "failed"
  | "dead_letter";

// After this many failed processing attempts, a webhook is dead-lettered:
// it stops being retried and is surfaced to ops, so one poison event can't
// churn forever or block the reconcile sweep.
const MAX_ATTEMPTS = 8;

/**
 * The inbox contract, shared by the webhook receiver and the reconciliation
 * poller: record that the event was SEEN (insert-if-new), skip if a previous
 * attempt fully PROCESSED it, otherwise dispatch the handler and mark
 * processed. A handler throw records the error and leaves the row
 * unprocessed so any later delivery — Dakota retry or reconcile sweep —
 * runs it again. Handlers are idempotent, so racing deliveries are safe.
 */
export async function recordAndProcessEvent(
  envelope: DakotaEventEnvelope,
  opts?: { eventId?: string; eventType?: string }
): Promise<{ outcome: ProcessOutcome; error?: string }> {
  const eventId = opts?.eventId ?? envelope.id;
  const eventType = opts?.eventType ?? envelope.type;

  await db
    .insert(webhookEvents)
    .values({ dakotaEventId: eventId, eventType, payload: envelope })
    .onConflictDoNothing({ target: webhookEvents.dakotaEventId });

  const [inboxRow] = await db
    .select({
      processedAt: webhookEvents.processedAt,
      attempts: webhookEvents.attempts,
      deadLetteredAt: webhookEvents.deadLetteredAt,
    })
    .from(webhookEvents)
    .where(eq(webhookEvents.dakotaEventId, eventId))
    .limit(1);

  if (inboxRow?.processedAt) {
    return { outcome: "already_processed" };
  }
  // A dead-lettered event is done retrying — a human owns it now.
  if (inboxRow?.deadLetteredAt) {
    return { outcome: "dead_letter" };
  }

  const handler = (handlers as Record<string, (typeof handlers)[string] | undefined>)[
    eventType
  ];
  try {
    if (handler) {
      await handler(envelope.data?.object ?? {}, envelope);
    }
    // Unhandled event types are acknowledged as no-ops: we subscribe with a
    // global target, so most of the 40 event types are informational to us.
    await db
      .update(webhookEvents)
      .set({ processedAt: new Date(), processingError: null })
      .where(eq(webhookEvents.dakotaEventId, eventId));

    return { outcome: handler ? "processed" : "ignored" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("dakota.event.processing_failed", {
      eventType,
      eventId,
      error: message,
    });
    // Bump the attempt counter; dead-letter once it crosses the ceiling.
    const [updated] = await db
      .update(webhookEvents)
      .set({
        processingError: message,
        attempts: sql`${webhookEvents.attempts} + 1`,
      })
      .where(eq(webhookEvents.dakotaEventId, eventId))
      .returning({ attempts: webhookEvents.attempts });

    if ((updated?.attempts ?? 0) >= MAX_ATTEMPTS) {
      await db
        .update(webhookEvents)
        .set({ deadLetteredAt: new Date() })
        .where(eq(webhookEvents.dakotaEventId, eventId));
      await alertOps("webhook_dead_letter", {
        eventType,
        eventId,
        attempts: updated?.attempts,
        error: message,
      });
      return { outcome: "dead_letter", error: message };
    }
    return { outcome: "failed", error: message };
  }
}
