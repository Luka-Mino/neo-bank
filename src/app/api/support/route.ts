// GET  /api/support — the caller's own support requests, newest first.
// POST /api/support — open a support request or complaint (plan 1c.3).
//
// Requests belong to the user (any org member may raise one). A linked
// transaction must belong to the caller's active org, so a request can't be
// pointed at someone else's payment. The support inbox (SUPPORT_EMAIL) gets
// an escaped copy; the user gets an in-app notification with the reference.

import { and, desc, eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { withOrg } from "@/lib/db/with-org";
import { supportRequests, transactions } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { sendNotificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import {
  escapeHtml,
  makeSupportReference,
  supportRequestSchema,
  type SupportRequestInput,
} from "@/lib/support";

const CATEGORY_LABEL: Record<SupportRequestInput["category"], string> = {
  question: "Question",
  complaint: "Complaint",
  card_dispute: "Card dispute",
  fraud: "Fraud or unauthorised activity",
};

function isUniqueViolation(e: unknown): boolean {
  const code = (e as { code?: string; cause?: { code?: string } })?.code ??
    (e as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

export const GET = apiHandler({
  handler: async ({ user }) => {
    const data = await db
      .select({
        id: supportRequests.id,
        reference: supportRequests.reference,
        category: supportRequests.category,
        subject: supportRequests.subject,
        status: supportRequests.status,
        createdAt: supportRequests.createdAt,
        resolvedAt: supportRequests.resolvedAt,
      })
      .from(supportRequests)
      .where(eq(supportRequests.userId, user.id))
      .orderBy(desc(supportRequests.createdAt))
      .limit(50);
    return ok({ data });
  },
});

export const POST = apiHandler({
  schema: supportRequestSchema,
  rateLimit: { limit: 10, window: "1h" },
  handler: async ({ user, body }) => {
    if (body.transactionId) {
      if (!user.orgId) return err("That payment wasn't found", 404);
      const orgId = user.orgId;
      const txId = body.transactionId;
      const [found] = await withOrg(orgId, (tx) =>
        tx
          .select({ id: transactions.id })
          .from(transactions)
          .where(and(eq(transactions.id, txId), eq(transactions.orgId, orgId)))
          .limit(1)
      );
      if (!found) return err("That payment wasn't found", 404);
    }

    // A reference clash is about one in 900 million; retry rather than fail.
    let row: { id: string; reference: string } | undefined;
    for (let attempt = 0; attempt < 3 && !row; attempt++) {
      try {
        [row] = await db
          .insert(supportRequests)
          .values({
            reference: makeSupportReference(),
            orgId: user.orgId ?? null,
            userId: user.id,
            category: body.category,
            subject: body.subject,
            message: body.message,
            transactionId: body.transactionId ?? null,
          })
          .returning({ id: supportRequests.id, reference: supportRequests.reference });
      } catch (e) {
        if (!isUniqueViolation(e) || attempt === 2) throw e;
      }
    }
    if (!row) return err("Something went wrong on our side.", 500);

    await logAudit({
      orgId: user.orgId ?? null,
      actorId: user.id,
      actorType: "user",
      action: "support.request_created",
      resourceType: "support_request",
      resourceId: row.id,
      metadata: { reference: row.reference, category: body.category },
    });

    await createNotification({
      userId: user.id,
      type: "support",
      title: `We've got your request (${row.reference})`,
      body: "We'll reply by email. Quote this reference if you contact us again.",
      actionUrl: "/app/more/help",
    });

    const inbox = process.env.SUPPORT_EMAIL;
    if (inbox) {
      try {
        await sendNotificationEmail({
          to: inbox,
          subject: `[${row.reference}] ${CATEGORY_LABEL[body.category]}: ${body.subject.replace(/[\r\n]+/g, " ")}`,
          heading: `${CATEGORY_LABEL[body.category]} · ${row.reference}`,
          body: [
            `From: ${escapeHtml(user.name ?? "")} &lt;${escapeHtml(user.email)}&gt;`,
            `User ID: ${user.id}${user.orgId ? ` · Org ID: ${user.orgId}` : ""}`,
            body.transactionId ? `Transaction: ${body.transactionId}` : "",
            `<strong>${escapeHtml(body.subject)}</strong>`,
            escapeHtml(body.message).replace(/\n/g, "<br>"),
          ]
            .filter(Boolean)
            .join("<br><br>"),
        });
      } catch (e) {
        // The request is saved; a mail outage must not lose it or fail the call.
        logger.error("Support inbox email failed:", { reference: row.reference, detail: e instanceof Error ? e.message : String(e) });
      }
    } else {
      logger.warn("SUPPORT_EMAIL not set; support request saved without an inbox copy", { reference: row.reference });
    }

    return ok({ id: row.id, reference: row.reference }, 201);
  },
});
