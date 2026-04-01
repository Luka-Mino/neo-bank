import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookEvents, dakotaCustomers, transactions } from "@/lib/db/schema";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
} from "@/lib/dakota/webhooks";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const eventId = req.headers.get("x-dakota-event-id");
    const eventType = req.headers.get("x-dakota-event-type");

    if (!signature || !timestamp || !eventId || !eventType) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Idempotency check
    const existing = await db
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.dakotaEventId, eventId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ status: "already_processed" });
    }

    const event = parseWebhookEvent(rawBody);

    // Store event
    await db.insert(webhookEvents).values({
      dakotaEventId: eventId,
      eventType,
      payload: event,
    });

    // Process event synchronously (for simplicity — can move to BullMQ later)
    await processEvent(eventType, event.data);

    // Mark as processed
    await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.dakotaEventId, eventId));

    return NextResponse.json({ status: "processed" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function processEvent(eventType: string, data: Record<string, unknown>) {
  switch (eventType) {
    case "customer.kyb_status.updated": {
      const customerId = data.customer_id as string;
      const kybStatus = data.kyb_status as string;
      if (customerId && kybStatus) {
        await db
          .update(dakotaCustomers)
          .set({ kycStatus: kybStatus, updatedAt: new Date() })
          .where(eq(dakotaCustomers.dakotaCustomerId, customerId));
      }
      break;
    }
    case "transaction.status.updated":
    case "transaction.one_off.updated":
    case "transaction.auto.updated": {
      const txId = data.id as string;
      const status = data.status as string;
      if (txId && status) {
        await db
          .update(transactions)
          .set({
            status,
            metadata: data as Record<string, unknown>,
            updatedAt: new Date(),
          })
          .where(eq(transactions.dakotaTxId, txId));
      }
      break;
    }
  }
}
