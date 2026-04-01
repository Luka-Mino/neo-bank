import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { transactions, dakotaCustomers } from "@/lib/db/schema";
import { createTransaction as createDakotaTransaction } from "@/lib/dakota/transactions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const txs = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(transactions.createdAt))
    .limit(50);

  return NextResponse.json({ data: txs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Get Dakota customer ID
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

    // Cache transaction locally
    const [tx] = await db
      .insert(transactions)
      .values({
        userId: session.user.id,
        dakotaTxId: dakotaTx.id,
        txType: body.txType || "send",
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

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
