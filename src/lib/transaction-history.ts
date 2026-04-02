import { db } from "@/lib/db";
import { transactionStatusHistory } from "@/lib/db/schema";

export async function logStatusChange(params: {
  transactionId: string;
  oldStatus: string | null;
  newStatus: string;
  reason?: string;
  actor?: string;
}) {
  try {
    await db.insert(transactionStatusHistory).values({
      transactionId: params.transactionId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      reason: params.reason,
      actor: params.actor || "system",
    });
  } catch (error) {
    console.error("Status history log error:", error);
  }
}
