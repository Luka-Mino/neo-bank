import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

/**
 * Invalidate every existing session for a user by bumping their token
 * version. Any JWT minted before this call is rejected at the next request
 * (see the jwt callback in src/lib/auth/config.ts). Call after a password
 * change, 2FA disable, or an explicit "sign out everywhere".
 */
export async function revokeSessions(userId: string, reason: string): Promise<void> {
  await db
    .update(users)
    .set({ tokenVersion: sql`${users.tokenVersion} + 1`, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await logAudit({
    actorType: "user",
    actorId: userId,
    action: "sessions_revoked",
    resourceType: "user",
    resourceId: userId,
    metadata: { reason },
  });
}
