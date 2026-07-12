// GET /api/auth/2fa — enrollment status for the Settings page.
import { eq } from "drizzle-orm";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const GET = apiHandler({
  handler: async ({ user }) => {
    const [row] = await db
      .select({ totpSecret: users.totpSecret, totpEnabledAt: users.totpEnabledAt })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    return ok({
      enabled: Boolean(row?.totpEnabledAt),
      // secret stored but never verified — enrollment abandoned midway
      pending: Boolean(row?.totpSecret && !row?.totpEnabledAt),
    });
  },
});
