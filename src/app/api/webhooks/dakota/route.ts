import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  webhookEvents,
  dakotaCustomers,
  transactions,
  users,
} from "@/lib/db/schema";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
} from "@/lib/dakota/webhooks";
import { logAudit } from "@/lib/audit";
import { logStatusChange } from "@/lib/transaction-history";
import { createNotification } from "@/lib/notifications";

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

    await db.insert(webhookEvents).values({
      dakotaEventId: eventId,
      eventType,
      payload: event,
    });

    await processEvent(eventType, event.data);

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

        // Find user for notification
        const [customer] = await db
          .select({ userId: dakotaCustomers.userId })
          .from(dakotaCustomers)
          .where(eq(dakotaCustomers.dakotaCustomerId, customerId))
          .limit(1);

        if (customer) {
          await createNotification({
            userId: customer.userId,
            type: "kyc_update",
            title: kybStatus === "active"
              ? "Identity Verified"
              : `KYC Status: ${kybStatus}`,
            body: kybStatus === "active"
              ? "Your identity has been verified. You can now deposit, withdraw, and send funds."
              : `Your verification status has been updated to ${kybStatus}.`,
            actionUrl: kybStatus === "active" ? "/dashboard" : "/onboarding",
          });

          await logAudit({
            actorType: "system",
            action: "kyc_status_updated",
            resourceType: "customer",
            resourceId: customerId,
            metadata: { status: kybStatus },
          });
        }
      }
      break;
    }

    case "transaction.status.updated":
    case "transaction.one_off.updated":
    case "transaction.auto.updated": {
      const txId = data.id as string;
      const newStatus = data.status as string;
      if (txId && newStatus) {
        // Get current status before updating
        const [existingTx] = await db
          .select({ id: transactions.id, status: transactions.status, userId: transactions.userId })
          .from(transactions)
          .where(eq(transactions.dakotaTxId, txId))
          .limit(1);

        if (existingTx) {
          const oldStatus = existingTx.status;

          await db
            .update(transactions)
            .set({
              status: newStatus,
              metadata: data,
              updatedAt: new Date(),
            })
            .where(eq(transactions.dakotaTxId, txId));

          // Log status transition
          await logStatusChange({
            transactionId: existingTx.id,
            oldStatus,
            newStatus,
          });

          // Notify user
          await createNotification({
            userId: existingTx.userId,
            type: "transaction_update",
            title: `Transaction ${newStatus}`,
            body: `Your transaction status changed from ${oldStatus} to ${newStatus}.`,
            actionUrl: `/transactions/${existingTx.id}`,
          });

          // Audit log
          await logAudit({
            actorType: "system",
            action: "transaction_status_updated",
            resourceType: "transaction",
            resourceId: existingTx.id,
            metadata: { oldStatus, newStatus, dakotaTxId: txId },
          });
        }
      }
      break;
    }
  }
}
