import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { dakotaAccounts, dakotaCustomers } from "@/lib/db/schema";
import { createAccount as createDakotaAccount } from "@/lib/dakota/accounts";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  let query = db
    .select()
    .from(dakotaAccounts)
    .where(eq(dakotaAccounts.userId, session.user.id));

  const accounts = await query;
  const filtered = type
    ? accounts.filter((a) => a.accountType === type)
    : accounts;

  return NextResponse.json({ data: filtered });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const customer = await db
      .select()
      .from(dakotaCustomers)
      .where(eq(dakotaCustomers.userId, session.user.id))
      .limit(1);

    if (customer.length === 0 || customer[0].kycStatus !== "active") {
      return NextResponse.json(
        { error: "KYC verification required" },
        { status: 403 }
      );
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
        userId: session.user.id,
        dakotaAccountId: dakotaAccount.id,
        accountType: body.accountType,
        sourceAsset: dakotaAccount.source_asset,
        destinationAsset: dakotaAccount.destination_asset,
        bankAccountInfo: dakotaAccount.bank_account_info as any,
      })
      .returning();

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
