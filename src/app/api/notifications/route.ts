import { eq, desc, isNull, and } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user, request }) => {
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

    let query = db
      .select()
      .from(notifications)
      .where(
        unreadOnly
          ? and(eq(notifications.userId, user.id), isNull(notifications.readAt))
          : eq(notifications.userId, user.id)
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const data = await query;
    return ok({ data });
  },
});

// Mark all as read
export const POST = apiHandler({
  handler: async ({ user }) => {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, user.id), isNull(notifications.readAt))
      );

    return ok({ message: "All notifications marked as read" });
  },
});
