// GDPR/CCPA data portability — GET /api/users/data returns a JSON export of
// everything Moneta holds about the caller, as a downloadable file. Read-only;
// scoped strictly to the authenticated user.
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  cards,
  transactions,
  recipients,
  notifications,
  dakotaCustomers,
  userPreferences,
  loginDevices,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Profile without secret material (no password hash, no 2FA secret).
  const [profile] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      emailVerifiedAt: users.emailVerifiedAt,
      twoFactorEnabled: users.totpEnabledAt,
      emailOtpEnabled: users.emailOtpEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [
    userAccounts,
    userCards,
    userTx,
    userRecipients,
    userNotifications,
    customer,
    prefs,
    devices,
  ] = await Promise.all([
    db.select().from(accounts).where(eq(accounts.userId, userId)),
    db.select().from(cards).where(eq(cards.userId, userId)),
    db.select().from(transactions).where(eq(transactions.userId, userId)),
    db.select().from(recipients).where(eq(recipients.userId, userId)),
    db.select().from(notifications).where(eq(notifications.userId, userId)),
    db.select().from(dakotaCustomers).where(eq(dakotaCustomers.userId, userId)),
    db.select().from(userPreferences).where(eq(userPreferences.userId, userId)),
    // Device rows without the raw fingerprint hash.
    db
      .select({
        userAgent: loginDevices.userAgent,
        firstSeenAt: loginDevices.firstSeenAt,
        lastSeenAt: loginDevices.lastSeenAt,
      })
      .from(loginDevices)
      .where(eq(loginDevices.userId, userId)),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile,
    verification: customer[0] ?? null,
    preferences: prefs[0] ?? null,
    accounts: userAccounts,
    cards: userCards,
    transactions: userTx,
    recipients: userRecipients,
    notifications: userNotifications,
    loginDevices: devices,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="moneta-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
