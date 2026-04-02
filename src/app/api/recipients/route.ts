import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { recipients, dakotaCustomers } from "@/lib/db/schema";
import { createRecipient as createDakotaRecipient } from "@/lib/dakota/recipients";
import { createRecipientSchema } from "@/lib/validators/recipient";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const data = await db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, user.id));

    return ok({ data });
  },
});

export const POST = apiHandler({
  schema: createRecipientSchema,
  handler: async ({ user, body }) => {
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (customer.length === 0) {
      return err("No customer record", 404);
    }

    const dakotaRecipient = await createDakotaRecipient({
      customerId: customer[0].dakotaCustomerId,
      name: body.name,
      address: body.address,
    });

    const [recipient] = await db
      .insert(recipients)
      .values({
        userId: user.id,
        dakotaRecipientId: dakotaRecipient.id,
        name: body.name,
      })
      .returning();

    return ok(recipient, 201);
  },
});
