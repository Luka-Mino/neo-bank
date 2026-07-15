// POST /api/auth/2fa/backup-codes — regenerate recovery codes.
// Requires a currently valid TOTP code (same guard as /disable) so a hijacked
// session can't silently mint itself a fresh set. Invalidates the old set and
// returns the new plaintext codes ONCE.
import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { decryptSecret, verifyTotpCode } from "@/lib/auth/totp";
import { generateBackupCodes } from "@/lib/auth/backup-codes";
import { logAudit } from "@/lib/audit";

const schema = z.object({ code: z.string().regex(/^\d{6}$/, "6-digit code") });

export const POST = apiHandler({
  schema,
  rateLimit: { limit: 5, window: "15m" },
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
      return err("Invalid code — backup codes unchanged", 400);
    }

    const backupCodes = await generateBackupCodes(user.id);

    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "2fa_backup_codes_regenerated",
      resourceType: "user",
      resourceId: user.id,
    });

    return ok({ backupCodes });
  },
});
