import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { recipients, dakotaCustomers } from "@/lib/db/schema";
import { createRecipient as createDakotaRecipient } from "@/lib/dakota/recipients";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(recipients)
    .where(eq(recipients.userId, session.user.id));

  return NextResponse.json({ data });
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

    if (customer.length === 0) {
      return NextResponse.json({ error: "No customer record" }, { status: 404 });
    }

    const dakotaRecipient = await createDakotaRecipient({
      customerId: customer[0].dakotaCustomerId,
      name: body.name,
      address: body.address,
    });

    const [recipient] = await db
      .insert(recipients)
      .values({
        userId: session.user.id,
        dakotaRecipientId: dakotaRecipient.id,
        name: body.name,
      })
      .returning();

    return NextResponse.json(recipient, { status: 201 });
  } catch (error) {
    console.error("Recipient creation error:", error);
    return NextResponse.json(
      { error: "Failed to create recipient" },
      { status: 500 }
    );
  }
}
