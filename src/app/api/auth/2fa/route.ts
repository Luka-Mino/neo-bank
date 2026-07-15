// GET /api/auth/2fa — enrollment status for the Settings page.
import { eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { countRemainingBackupCodes } from "@/lib/auth/backup-codes";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const [row] = await db
      .select({ totpSecret: users.totpSecret, totpEnabledAt: users.totpEnabledAt })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    const enabled = Boolean(row?.totpEnabledAt);
    return ok({
      enabled,
      // secret stored but never verified — enrollment abandoned midway
      pending: Boolean(row?.totpSecret && !row?.totpEnabledAt),
      backupCodesRemaining: enabled
        ? await countRemainingBackupCodes(user.id)
        : 0,
    });
  },
});
