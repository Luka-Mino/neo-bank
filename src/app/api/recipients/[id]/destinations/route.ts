import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { destinations } from "@/lib/db/schema";
import {
  createDestination as createDakotaDestination,
} from "@/lib/dakota/recipients";
import { createDestinationSchema } from "@/lib/validators/recipient";
import {
  assertRecipientOwnership,
  ownershipErr,
} from "@/lib/auth/ownership";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, params, db }) => {
    const { id } = params as { id: string };
    try {
      await assertRecipientOwnership(db, id, user.orgId!);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    const data = await db
      .select()
      .from(destinations)
      .where(eq(destinations.recipientId, id));
    return ok({ data });
  },
});

// Not orgScoped: makes a Dakota HTTP call. Explicit org predicate via the helper.
export const POST = apiHandler({
  schema: createDestinationSchema,
  handler: async ({ user, params, body, db }) => {
    if (!user.orgId) return err("No active organization", 403);
    const { id } = params as { id: string };

    let recipient;
    try {
      recipient = await assertRecipientOwnership(db, id, user.orgId);
    } catch (e) {
      const o = ownershipErr(e);
      if (o) return err(o.message, o.status);
      throw e;
    }

    const dakotaDestination = await createDakotaDestination({
      recipientId: recipient.dakotaRecipientId,
      destinationType: body.destinationType,
      name: body.name,
      cryptoAddress: body.cryptoAddress,
      networkId: body.networkId,
      assets: body.assets,
      abaRoutingNumber: body.abaRoutingNumber,
      abaWireRoutingNumber: body.abaWireRoutingNumber,
      accountNumber: body.accountNumber,
      accountType: body.accountType,
      accountHolderName: body.accountHolderName,
      bankName: body.bankName,
      accountHolderAddress: body.accountHolderAddress,
      bankAddress: body.bankAddress,
      iban: body.iban,
      bic: body.bic,
      capabilities: body.capabilities,
    });

    const [destination] = await db
      .insert(destinations)
      .values({
        orgId: user.orgId, // denormalized for RLS; matches the recipient's org
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
