// Dakota on-ramp / off-ramp rails. NOT user-facing accounts.
// Renamed from /api/accounts → /api/rails to free the word "accounts"
// for the user-facing concept (checking, savings, etc.).
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { dakotaRails, dakotaCustomers } from "@/lib/db/schema";
import { createAccount as createDakotaAccount } from "@/lib/dakota/accounts";
import { createRailSchema } from "@/lib/validators/rail";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";

export const GET = apiHandler({
  orgScoped: true,
  handler: async ({ user, request, db }) => {
    const type = request.nextUrl.searchParams.get("type");

    const rails = await db
      .select()
      .from(dakotaRails)
      .where(eq(dakotaRails.orgId, user.orgId!));

    const filtered = type ? rails.filter((r) => r.accountType === type) : rails;

    return ok({ data: filtered });
  },
});

// Not orgScoped: makes a Dakota HTTP call. Explicit org predicates.
export const POST = apiHandler({
  schema: createRailSchema,
  handler: async ({ user, body, db }) => {
    if (!user.orgId) return err("No active organization", 403);
    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.orgId, user.orgId))
      .limit(1);

    if (
      !isKycBypassed() &&
      (customer.length === 0 || customer[0].kycStatus !== "active")
    ) {
      return err("KYC verification required", 403);
    }

    const dakotaAccount = await createDakotaAccount({
      accountType: body.accountType,
      customerId: customer[0]?.dakotaCustomerId ?? "",
      cryptoDestinationId: body.cryptoDestinationId,
      fiatDestinationId: body.fiatDestinationId,
      sourceAsset: body.sourceAsset,
      destinationAsset: body.destinationAsset,
      sourceNetworkId: body.sourceNetworkId,
      destinationNetworkId: body.destinationNetworkId,
      capabilities: body.capabilities,
    });

    const [rail] = await db
      .insert(dakotaRails)
      .values({
        orgId: user.orgId,
        userId: user.id,
        dakotaAccountId: dakotaAccount.id,
        accountType: body.accountType,
        sourceAsset: dakotaAccount.source_asset,
        destinationAsset: dakotaAccount.destination_asset,
        bankAccountInfo: dakotaAccount.bank_account,
      })
      .returning();

    return ok(rail, 201);
  },
});
