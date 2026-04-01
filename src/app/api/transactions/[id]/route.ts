import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tx = await db
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.id, id), eq(transactions.userId, session.user.id))
    )
    .limit(1);

  if (tx.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(tx[0]);
}
