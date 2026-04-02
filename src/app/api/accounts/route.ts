import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { dakotaAccounts, dakotaCustomers } from "@/lib/db/schema";
import { createAccount as createDakotaAccount } from "@/lib/dakota/accounts";
import { createAccountSchema } from "@/lib/validators/account";

export const GET = apiHandler({
  handler: async ({ user, request }) => {
    const type = request.nextUrl.searchParams.get("type");

    const accounts = await db
      .select()
      .from(dakotaAccounts)
      .where(eq(dakotaAccounts.userId, user.id));

    const filtered = type
      ? accounts.filter((a) => a.accountType === type)
      : accounts;

    return ok({ data: filtered });
  },
});

export const POST = apiHandler({
  schema: createAccountSchema,
  handler: async ({ user, body }) => {
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, user.id))
      .limit(1);

    if (customer.length === 0 || customer[0].kycStatus !== "active") {
      return err("KYC verification required", 403);
    }

    const dakotaAccount = await createDakotaAccount({
      accountType: body.accountType,
      customerId: customer[0].dakotaCustomerId,
      cryptoDestinationId: body.cryptoDestinationId,
      fiatDestinationId: body.fiatDestinationId,
      sourceAsset: body.sourceAsset,
      destinationAsset: body.destinationAsset,
      sourceNetworkId: body.sourceNetworkId,
      destinationNetworkId: body.destinationNetworkId,
      capabilities: body.capabilities,
    });

    const [account] = await db
      .insert(dakotaAccounts)
      .values({
        userId: user.id,
        dakotaAccountId: dakotaAccount.id,
        accountType: body.accountType,
        sourceAsset: dakotaAccount.source_asset,
        destinationAsset: dakotaAccount.destination_asset,
        bankAccountInfo: dakotaAccount.bank_account_info as any,
      })
      .returning();

    return ok(account, 201);
  },
});
