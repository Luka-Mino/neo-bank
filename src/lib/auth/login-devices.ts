import { createHash } from "node:crypto";
import { currentKey, keyring } from "@/lib/crypto/keyring";
import { logger } from "@/lib/logger";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginDevices } from "@/lib/db/schema";
import { createNotification } from "@/lib/notifications";

// "Is this you signing in?" — records the device on each login and alerts
// (in-app + email, gated by the security-email pref) the first time a login
// arrives from a device/location we haven't seen for this user. The very
// first device a user ever signs in from is recorded silently (there's no
// prior baseline to compare against).

/** Coarse device fingerprint: UA + first two IP octets, salted with an
 *  HMAC_KEYS key (the implicit `legacy` entry is AUTH_SECRET, as before).
 *  IP is truncated so a rotating home IP within the same ISP block doesn't
 *  re-alert on every login, while a genuinely new network does. */
export function deviceFingerprint(
  userId: string,
  userAgent: string,
  ip: string,
  material: string = currentKey("HMAC_KEYS").material
): string {
  const ipPrefix = ip.includes(".")
    ? ip.split(".").slice(0, 2).join(".") // IPv4 /16
    : ip.split(":").slice(0, 3).join(":"); // IPv6 approx
  return createHash("sha256")
    .update(`${material}|${userId}|${userAgent}|${ipPrefix}`)
    .digest("hex");
}

export async function recordLoginDevice(params: {
  userId: string;
  userAgent: string;
  ip: string;
}): Promise<void> {
  const fingerprint = deviceFingerprint(params.userId, params.userAgent, params.ip);
  // Match under every key, so rotating HMAC_KEYS doesn't make every known
  // device look new (and trigger a wave of "new sign-in" alerts).
  const candidates = keyring("HMAC_KEYS").map((k) =>
    deviceFingerprint(params.userId, params.userAgent, params.ip, k.material)
  );

  try {
    const existing = await db
      .select({ id: loginDevices.id })
      .from(loginDevices)
      .where(
        and(
          eq(loginDevices.userId, params.userId),
          inArray(loginDevices.fingerprint, candidates)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Re-stamp with the current key so old keys can eventually be retired.
      await db
        .update(loginDevices)
        .set({ lastSeenAt: new Date(), fingerprint })
        .where(eq(loginDevices.id, existing[0].id));
      return;
    }

    // New fingerprint. Alert only if the user already had a device on file —
    // otherwise this is their first-ever sign-in.
    const priorCount = await db
      .select({ id: loginDevices.id })
      .from(loginDevices)
      .where(eq(loginDevices.userId, params.userId))
      .limit(1);
    const isAdditionalDevice = priorCount.length > 0;

    await db
      .insert(loginDevices)
      .values({
        userId: params.userId,
        fingerprint,
        userAgent: params.userAgent.slice(0, 400),
      })
      .onConflictDoNothing({
        target: [loginDevices.userId, loginDevices.fingerprint],
      });

    if (isAdditionalDevice) {
      await createNotification({
        userId: params.userId,
        type: "security",
        title: "New sign-in to your Moneta account",
        body: "We noticed a sign-in from a device or location we haven't seen before. If this was you, no action is needed. If it wasn't, change your password and enable two-factor authentication right away.",
        actionUrl: "/app/more/settings",
      });
    }
  } catch (error) {
    // Never block a legitimate login on the alerting path.
    logger.error("Login-device tracking error:", { detail: error instanceof Error ? error.message : String(error) })
  }
}
