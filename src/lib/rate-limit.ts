// Rate limiting — adapted from Lawzy
// Supports Upstash Redis (production) with in-memory fallback (dev)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function memoryRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup > 600000) {
    lastCleanup = now;
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }
  const entry = memoryStore.get(ip);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  entry.count++;
  if (entry.count > limit)
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export async function rateLimit(
  ip: string,
  limit = 20,
  windowMs = 60 * 60 * 1000
) {
  // TODO: Add Upstash Redis when UPSTASH_REDIS_REST_URL is configured
  return memoryRateLimit(ip, limit, windowMs);
}

/**
 * Bucket key for API rate limits: client IP + the route, so each endpoint
 * has its own budget. (Keying on IP alone made every limited endpoint share
 * one counter — a few normal requests could exhaust a strict 5/15m endpoint
 * like forgot-password.) ID-like path segments collapse to ":id" so varying
 * an id in the URL can't mint fresh buckets.
 */
export function rateLimitKey(ip: string, pathname: string): string {
  const route = pathname
    .split("/")
    .map((seg) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) ||
      /^[0-9A-Za-z]{20,}$/.test(seg) ||
      /^\d+$/.test(seg)
        ? ":id"
        : seg
    )
    .join("/");
  return `${ip}|${route}`;
}

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
