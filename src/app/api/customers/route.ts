import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { dakotaCustomers } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (customer.length === 0) {
      return err("No customer record found", 404);
    }

    return ok(customer[0]);
  },
});
