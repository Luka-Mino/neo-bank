import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";
import type { DakotaEventEnvelope } from "./webhooks";
import { handlers } from "./webhook-handlers";

export type ProcessOutcome = "processed" | "ignored" | "already_processed" | "failed";

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
    .select({ processedAt: webhookEvents.processedAt })
    .from(webhookEvents)
    .where(eq(webhookEvents.dakotaEventId, eventId))
    .limit(1);

  if (inboxRow?.processedAt) {
    return { outcome: "already_processed" };
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
    console.error(`Dakota event ${eventType} (${eventId}) processing error:`, error);
    await db
      .update(webhookEvents)
      .set({ processingError: message })
      .where(eq(webhookEvents.dakotaEventId, eventId));
    return { outcome: "failed", error: message };
  }
}
