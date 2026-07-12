// DELETE /api/transfers/recurring/[id] — cancel a rule (soft; keeps history).
import { and, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { recurringTransfers } from "@/lib/db/schema";

export const DELETE = apiHandler({
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };
    const [updated] = await db
      .update(recurringTransfers)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(eq(recurringTransfers.id, id), eq(recurringTransfers.userId, user.id))
      )
      .returning({ id: recurringTransfers.id });
    if (!updated) return err("Rule not found", 404);
    return ok({ cancelled: true });
  },
});
