import { eq, desc } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { transactions, dakotaCustomers } from "@/lib/db/schema";
import { createTransaction as createDakotaTransaction } from "@/lib/dakota/transactions";
import { createTransactionSchema } from "@/lib/validators/transaction";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    return ok({ data: txs });
  },
});

export const POST = apiHandler({
  schema: createTransactionSchema,
  handler: async ({ user, body }) => {
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (customer.length === 0 || customer[0].kycStatus !== "active") {
      return err("KYC verification required", 403);
    }

    const dakotaTx = await createDakotaTransaction({
      amount: body.amount,
      customerId: customer[0].dakotaCustomerId,
      sourceNetworkId: body.sourceNetworkId,
      sourceAsset: body.sourceAsset,
      destinationId: body.destinationId,
      destinationAsset: body.destinationAsset,
      destinationNetworkId: body.destinationNetworkId,
      destinationPaymentRail: body.destinationPaymentRail,
      paymentReference: body.paymentReference,
    });

    const [tx] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        dakotaTxId: dakotaTx.id,
        txType: body.txType,
        status: dakotaTx.status,
        sourceAsset: body.sourceAsset,
        destinationAsset: body.destinationAsset,
        sourceAmount: body.amount,
        sourceNetwork: body.sourceNetworkId,
        destinationNetwork: body.destinationNetworkId,
        destinationId: body.destinationId,
        metadata: dakotaTx as unknown as Record<string, unknown>,
      })
      .returning();

    return ok(tx, 201);
  },
});
