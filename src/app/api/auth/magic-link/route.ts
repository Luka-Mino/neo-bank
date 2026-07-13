// POST /api/auth/magic-link — request a passwordless sign-in link.
// Mirrors forgot-password: always returns the same response regardless of
// whether the account exists (no email enumeration). The link is single-use
// and short-lived; consuming it happens through the "magic-link" credentials
// provider (see src/lib/auth/config.ts).
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { apiHandler, ok } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { users, magicLinkTokens } from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

const schema = z.object({ email: z.string().email() });

const SAME_RESPONSE = {
  message: "If an account exists for that email, a sign-in link is on its way.",
};

export const POST = apiHandler({
  auth: false,
  rateLimit: { limit: 5, window: "15m" },
  schema,
  handler: async ({ body }) => {
    const email = body.email.toLowerCase();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return ok(SAME_RESPONSE);

    // 32 bytes of entropy, single-use, 15-minute lifetime.
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(magicLinkTokens).values({ userId: user.id, token, expiresAt });
    await sendMagicLinkEmail(email, token);
    await logAudit({
      actorType: "user",
      actorId: user.id,
      action: "magic_link_requested",
      resourceType: "user",
      resourceId: user.id,
    });

    return ok(SAME_RESPONSE);
  },
});
