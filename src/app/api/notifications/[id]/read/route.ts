import { eq, and } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export const PATCH = apiHandler({
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };

    const [updated] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.id, id), eq(notifications.userId, user.id))
      )
      .returning();

    if (!updated) {
      return err("Notification not found", 404);
    }

    return ok(updated);
  },
});
