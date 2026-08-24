// GET /api/transactions/export[?accountId=&from=&to=] — CSV statement.
import { NextResponse } from "next/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { apiHandler, err } from "@/lib/api-handler";
import { transactions } from "@/lib/db/schema";
import { assertAccountOwnership, ownershipErr } from "@/lib/auth/ownership";

function csvField(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = apiHandler({
  orgScoped: true,
  requireExport: true,
  handler: async ({ user, request, db }) => {
    const accountId = request.nextUrl.searchParams.get("accountId");
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");

    if (accountId) {
      try {
        await assertAccountOwnership(db, accountId, user.orgId!);
      } catch (e) {
        const o = ownershipErr(e);
        if (o) return err(o.message, o.status);
        throw e;
      }
    }

    const conditions = [eq(transactions.orgId, user.orgId!)];
    if (accountId) conditions.push(eq(transactions.accountId, accountId));
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) conditions.push(gte(transactions.createdAt, d));
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) conditions.push(lte(transactions.createdAt, d));
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(asc(transactions.createdAt))
      .limit(5000);

    const header = [
      "Date",
      "Type",
      "Status",
      "Category",
      "Amount",
      "Asset",
      "Counter Amount",
      "Counter Asset",
      "Statement Reference",
      "Transaction ID",
    ];
    const lines = [header.join(",")];
    for (const tx of rows) {
      const meta = (tx.metadata ?? {}) as Record<string, unknown>;
      lines.push(
        [
          csvField(tx.createdAt.toISOString()),
          csvField(tx.txType),
          csvField(tx.status),
          csvField(tx.category ?? ""),
          csvField(tx.sourceAmount ?? ""),
          csvField(tx.sourceAsset ?? ""),
          csvField(tx.destinationAmount ?? ""),
          csvField(tx.destinationAsset ?? ""),
          csvField(meta.payment_reference ?? ""),
          csvField(tx.dakotaTxId),
        ].join(",")
      );
    }

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(lines.join("\r\n") + "\r\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="moneta-statement-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  },
});
