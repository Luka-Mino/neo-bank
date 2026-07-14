// Manage email-code 2FA.
// GET    → { enabled }
// POST   → enable  (requires a verified email; can't stack on top of TOTP)
// DELETE → disable
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const [row] = await db
      .select({ enabled: users.emailOtpEnabled })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    return ok({ enabled: Boolean(row?.enabled) });
  },
});

export const POST = apiHandler({
  rateLimit: { limit: 5, window: "1h" },
  handler: async ({ user }) => {
    const [row] = await db
      .select({
        totpEnabledAt: users.totpEnabledAt,
        emailVerifiedAt: users.emailVerifiedAt,
        emailOtpEnabled: users.emailOtpEnabled,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    if (!row) return err("User not found", 404);
    if (row.totpEnabledAt) {
      return err("Authenticator-app 2FA is already enabled", 409);
    }
    // Only enforce email-verification once email actually delivers.
    if (process.env.RESEND_API_KEY && !row.emailVerifiedAt) {
      return err("Verify your email before enabling email codes", 400);
    }

    await db
      .update(users)
      .set({ emailOtpEnabled: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "email_otp_enabled",
      resourceType: "user",
      resourceId: user.id,
    });
    await createNotification({
      userId: user.id,
      type: "security",
      title: "Email sign-in codes enabled",
      body: "You'll now get a one-time code by email each time you sign in.",
      actionUrl: "/settings",
    });
    return ok({ enabled: true });
  },
});

export const DELETE = apiHandler({
  handler: async ({ user }) => {
    await db
      .update(users)
      .set({ emailOtpEnabled: false, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "email_otp_disabled",
      resourceType: "user",
      resourceId: user.id,
    });
    return ok({ enabled: false });
  },
});
