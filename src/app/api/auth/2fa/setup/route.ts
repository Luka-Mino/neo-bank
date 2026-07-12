// POST /api/auth/2fa/setup — begin TOTP enrollment.
// Stores the (encrypted) secret in a PENDING state: totp_enabled_at stays
// null until /verify proves the user's authenticator produces valid codes,
// so a user can never lock themselves out by abandoning setup halfway.
import { eq } from "drizzle-orm";
import { apiHandler, ok, err } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { encryptSecret, generateTotpSecret } from "@/lib/auth/totp";

export const POST = apiHandler({
  rateLimit: { limit: 5, window: "15m" },
  handler: async ({ user }) => {
    const [row] = await db
      .select({ totpEnabledAt: users.totpEnabledAt, email: users.email })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    if (!row) return err("User not found", 404);
    if (row.totpEnabledAt) {
      return err("Two-factor authentication is already enabled", 409);
    }

    const { base32Secret, otpauthUrl } = generateTotpSecret(row.email);

    await db
      .update(users)
      .set({
        totpSecret: encryptSecret(base32Secret),
        totpEnabledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // secret is returned ONCE for manual entry; only the encrypted form
    // is persisted.
    return ok({ otpauthUrl, secret: base32Secret });
  },
});
