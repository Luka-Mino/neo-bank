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
// Webhook bodies are small JSON envelopes; a legitimate one is well under
// this. Reject anything larger before doing any work — a cheap guard against
// a malicious oversized payload.
const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  }
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

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
