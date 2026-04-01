import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { dakotaCustomers } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await db
    .select()
    .from(dakotaCustomers)
    .where(eq(dakotaCustomers.userId, session.user.id))
    .limit(1);

  if (customer.length === 0) {
    return NextResponse.json({ error: "No customer record found" }, { status: 404 });
  }

  return NextResponse.json(customer[0]);
}
