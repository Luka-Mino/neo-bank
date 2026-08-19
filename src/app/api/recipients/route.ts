import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { recipients, dakotaCustomers } from "@/lib/db/schema";
import { createRecipient as createDakotaRecipient } from "@/lib/dakota/recipients";
import { createRecipientSchema } from "@/lib/validators/recipient";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, db }) => {
    const data = await db
      .select()
      .from(recipients)
      .where(eq(recipients.orgId, user.orgId!));
    return ok({ data });
  },
});

// Not orgScoped: makes a Dakota HTTP call. Explicit org predicates instead.
export const POST = apiHandler({
  schema: createRecipientSchema,
  handler: async ({ user, body, db }) => {
    if (!user.orgId) return err("No active organization", 403);

    const [customer] = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, user.orgId))
      .limit(1);
    if (!customer) return err("No customer record", 404);

    const dakotaRecipient = await createDakotaRecipient({
      customerId: customer.dakotaCustomerId,
      name: body.name,
      address: body.address,
    });

    const [recipient] = await db
      .insert(recipients)
      .values({
        orgId: user.orgId,
        userId: user.id, // creator
        dakotaRecipientId: dakotaRecipient.id,
        name: body.name,
      })
      .returning();

    return ok(recipient, 201);
  },
});
