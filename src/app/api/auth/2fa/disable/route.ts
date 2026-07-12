// POST /api/auth/2fa/disable — turn off TOTP. Requires a currently valid
// code so a hijacked session can't silently strip the account's 2FA.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { decryptSecret, verifyTotpCode } from "@/lib/auth/totp";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({ code: z.string().regex(/^\d{6}$/, "6-digit code") });

export const POST = apiHandler({
  schema,
  rateLimit: { limit: 10, window: "15m" },
  handler: async ({ user, body }) => {
    const [row] = await db
      .select({ totpSecret: users.totpSecret, totpEnabledAt: users.totpEnabledAt })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    if (!row?.totpSecret || !row.totpEnabledAt) {
      return err("Two-factor authentication is not enabled", 409);
    }

    if (!verifyTotpCode(decryptSecret(row.totpSecret), body.code)) {
      return err("Invalid code — 2FA remains enabled", 400);
    }

    await db
      .update(users)
      .set({ totpSecret: null, totpEnabledAt: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "2fa_disabled",
      resourceType: "user",
      resourceId: user.id,
    });
    await createNotification({
      userId: user.id,
      type: "security",
      title: "Two-factor authentication disabled",
      body: "Authenticator codes are no longer required at sign-in. If this wasn't you, reset your password immediately.",
      actionUrl: "/settings",
    });

    return ok({ enabled: false });
  },
});
