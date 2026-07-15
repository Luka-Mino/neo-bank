// POST /api/auth/2fa/verify — complete TOTP enrollment by proving a code.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { decryptSecret, verifyTotpCode } from "@/lib/auth/totp";
import { generateBackupCodes } from "@/lib/auth/backup-codes";
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
    if (!row?.totpSecret) return err("No 2FA enrollment in progress", 409);
    if (row.totpEnabledAt) return err("Two-factor authentication is already enabled", 409);

    if (!verifyTotpCode(decryptSecret(row.totpSecret), body.code)) {
      return err("Invalid code — check your authenticator app and try again", 400);
    }

    await db
      .update(users)
      .set({ totpEnabledAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Issue recovery codes so a lost authenticator isn't a permanent lockout.
    // Returned once here; only hashes are stored.
    const backupCodes = await generateBackupCodes(user.id);

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "2fa_enabled",
      resourceType: "user",
      resourceId: user.id,
    });
    await createNotification({
      userId: user.id,
      type: "security",
      title: "Two-factor authentication enabled",
      body: "Your account now requires an authenticator code at sign-in.",
      actionUrl: "/settings",
    });

    return ok({ enabled: true, backupCodes });
  },
});
