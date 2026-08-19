import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { transactions } from "@/lib/db/schema";
import { isCategory } from "@/lib/categorize";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, db }) => {
    const { id } = params as { id: string };

    const tx = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.orgId, user.orgId!)))
      .limit(1);

    if (tx.length === 0) {
      return err("Transaction not found", 404);
    }

    return ok(tx[0]);
  },
});

// PATCH — user recategorization (manual override; auto-categorizer never
// touches a row that already has a category).
const patchSchema = z.object({
  category: z.string().refine(isCategory, "Unknown category"),
});

export const PATCH = apiHandler<z.infer<typeof patchSchema>>({
  orgScoped: true,
  schema: patchSchema,
  handler: async ({ user, params, body, db }) => {
    const { id } = params as { id: string };
    const [updated] = await db
      .update(transactions)
      .set({ category: body.category, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.orgId, user.orgId!)))
      .returning();
    if (!updated) return err("Transaction not found", 404);
    return ok(updated);
  },
});
