import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
    });
  } catch (error) {
    console.error("Notification creation error:", error);
  }
}
