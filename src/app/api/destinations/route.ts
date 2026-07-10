// GET /api/destinations[?type=fiat_us] — all of the caller's destinations
// across their recipients, joined with the recipient for display. This is
// what pickers (e.g. "withdraw to which bank?") consume; destinationId for
// POST /api/transactions is the `dakotaDestinationId` field.
import { and, eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { destinations, recipients } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user, request }) => {
    const type = request.nextUrl.searchParams.get("type");

    const rows = await db
      .select({
        id: destinations.id,
        dakotaDestinationId: destinations.dakotaDestinationId,
        destinationType: destinations.destinationType,
        label: destinations.label,
        details: destinations.details,
        createdAt: destinations.createdAt,
        recipientId: recipients.id,
        recipientName: recipients.name,
      })
      .from(destinations)
      .innerJoin(recipients, eq(destinations.recipientId, recipients.id))
      .where(
        type
          ? and(eq(recipients.userId, user.id), eq(destinations.destinationType, type))
          : eq(recipients.userId, user.id)
      );

    // details holds the full validated create payload — mask account numbers
    // down to last4 for display (Dakota masks them in its responses too).
    const data = rows.map((row) => {
      const d = (row.details ?? {}) as Record<string, unknown>;
      const accountNumber = typeof d.accountNumber === "string" ? d.accountNumber : undefined;
      return {
        ...row,
        details: {
          bankName: d.bankName,
          accountType: d.accountType,
          accountHolderName: d.accountHolderName,
          last4: accountNumber ? accountNumber.slice(-4) : undefined,
          networkId: d.networkId,
          cryptoAddress: d.cryptoAddress,
        },
      };
    });

    return ok({ data });
  },
});
