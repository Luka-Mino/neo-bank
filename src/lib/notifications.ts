import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { notifications, userPreferences, users } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
}

// Which preference toggle governs each notification type. Types not listed
// (product/marketing) fall under emailProduct, default OFF.
function emailPrefFor(type: string): keyof PrefRow {
  if (type === "transaction_update") return "emailTransactions";
  if (type === "security" || type === "kyc_update") return "emailSecurity";
  return "emailProduct";
}

interface PrefRow {
  emailTransactions: boolean;
  emailSecurity: boolean;
  emailProduct: boolean;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
    });
  } catch (error) {
    logger.error("Notification creation error:", { detail: error instanceof Error ? error.message : String(error) })
  }

  // Email mirror — best-effort, never blocks or fails the caller (which is
  // often a money-moving webhook handler).
  try {
    const [row] = await db
      .select({
        email: users.email,
        emailTransactions: userPreferences.emailTransactions,
        emailSecurity: userPreferences.emailSecurity,
        emailProduct: userPreferences.emailProduct,
      })
      .from(users)
      .leftJoin(userPreferences, eq(userPreferences.userId, users.id))
      .where(eq(users.id, params.userId))
      .limit(1);
    if (!row?.email) return;

    const prefs: PrefRow = {
      // No prefs row yet → table defaults (transactions/security on).
      emailTransactions: row.emailTransactions ?? true,
      emailSecurity: row.emailSecurity ?? true,
      emailProduct: row.emailProduct ?? false,
    };
    if (!prefs[emailPrefFor(params.type)]) return;

    await sendNotificationEmail({
      to: row.email,
      subject: params.title,
      heading: params.title,
      body: params.body ?? "",
      actionUrl: params.actionUrl,
      actionLabel: params.actionUrl ? "View in Moneta" : undefined,
    });
  } catch (error) {
    logger.error("Notification email error:", { detail: error instanceof Error ? error.message : String(error) })
  }
}
