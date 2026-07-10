import { NextRequest, NextResponse } from "next/server";
import {
  parseEventEnvelope,
  verifyWebhookSignature,
  type DakotaEventEnvelope,
} from "@/lib/dakota/webhooks";
import { recordAndProcessEvent } from "@/lib/dakota/event-processing";

/**
 * Dakota webhook receiver.
 *
 * Contract with Dakota: respond 2xx within 30s on success; any other
 * response is retried (10 attempts over ~48h). So: verify fast, record the
 * event, do the work, and return 500 on processing failure so Dakota keeps
 * retrying — the inbox row distinguishes "seen" (row exists) from
 * "processed" (processedAt set), which is what makes retries safe without
 * making one failure permanent. The reconciliation poller
 * (src/lib/dakota/reconcile.ts) is the backstop after Dakota's retry window.
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

  const { outcome } = await recordAndProcessEvent(envelope, { eventId, eventType });

  if (outcome === "failed") {
    // Non-2xx → Dakota retries with backoff; the unprocessed inbox row lets
    // the retry run the handler again.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ status: outcome });
}
