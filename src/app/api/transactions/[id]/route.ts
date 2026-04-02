import { eq, and } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };

    const tx = await db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, user.id))
      )
      .limit(1);

    if (tx.length === 0) {
      return err("Transaction not found", 404);
    }

    return ok(tx[0]);
  },
});
