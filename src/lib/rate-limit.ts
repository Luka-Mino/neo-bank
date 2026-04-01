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

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
