import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";
import {
  parseEventEnvelope,
  verifyWebhookSignature,
  type DakotaEventEnvelope,
} from "@/lib/dakota/webhooks";
import { handlers } from "@/lib/dakota/webhook-handlers";

/**
 * Dakota webhook receiver.
 *
 * Contract with Dakota: respond 2xx within 30s on success; any other
 * response is retried (10 attempts over ~48h). So: verify fast, record the
 * event, do the work, and return 500 on processing failure so Dakota keeps
 * retrying — the inbox row distinguishes "seen" (row exists) from
 * "processed" (processedAt set), which is what makes retries safe without
 * making one failure permanent.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");
  const headerEventId = req.headers.get("x-dakota-event-id");
  const headerEventType = req.headers.get("x-dakota-event-type");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let envelope: DakotaEventEnvelope;
  try {
    envelope = parseEventEnvelope(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const eventId = headerEventId ?? envelope.id;
  const eventType = headerEventType ?? envelope.type;
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Missing event id or type" }, { status: 400 });
  }

  // Record that we've SEEN the event. A pre-existing row only short-circuits
  // if it was fully processed — an unprocessed row means a previous attempt
  // failed and this delivery is Dakota's retry.
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
    return NextResponse.json({ status: "already_processed" });
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

    return NextResponse.json({ status: handler ? "processed" : "ignored" });
  } catch (error) {
    console.error(`Webhook ${eventType} (${eventId}) processing error:`, error);
    await db
      .update(webhookEvents)
      .set({ processingError: error instanceof Error ? error.message : String(error) })
      .where(eq(webhookEvents.dakotaEventId, eventId));
    // Non-2xx → Dakota retries with backoff; the unprocessed inbox row lets
    // the retry run the handler again.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
