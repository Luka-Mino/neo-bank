import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { recipients, destinations } from "@/lib/db/schema";
import { createDestination as createDakotaDestination, listDestinations as listDakotaDestinations } from "@/lib/dakota/recipients";
import { createDestinationSchema } from "@/lib/validators/recipient";

export const GET = apiHandler({
  handler: async ({ user, params }) => {
    const { id } = params as { id: string };

    // Verify recipient belongs to user
    const [recipient] = await db
      .select()
      .from(recipients)
      .where(eq(recipients.id, id))
      .limit(1);

    if (!recipient || recipient.userId !== user.id) {
      return err("Recipient not found", 404);
    }

    const data = await db
      .select()
      .from(destinations)
      .where(eq(destinations.recipientId, id));

    return ok({ data });
  },
});

export const POST = apiHandler({
  schema: createDestinationSchema,
  handler: async ({ user, params, body }) => {
    const { id } = params as { id: string };

    // Verify recipient belongs to user
    const [recipient] = await db
      .select()
      .from(recipients)
      .where(eq(recipients.id, id))
      .limit(1);

    if (!recipient || recipient.userId !== user.id) {
      return err("Recipient not found", 404);
    }

    const dakotaDestination = await createDakotaDestination({
      recipientId: recipient.dakotaRecipientId,
      destinationType: body.destinationType,
      name: body.name,
      cryptoAddress: body.cryptoAddress,
      networkId: body.networkId,
      assets: body.assets,
      abaRoutingNumber: body.abaRoutingNumber,
      accountNumber: body.accountNumber,
      accountType: body.accountType,
      iban: body.iban,
      bic: body.bic,
    });

    const [destination] = await db
      .insert(destinations)
      .values({
        recipientId: id,
        dakotaDestinationId: dakotaDestination.id,
        destinationType: body.destinationType,
        label: body.name,
        details: body as Record<string, unknown>,
      })
      .returning();

    return ok(destination, 201);
  },
});
