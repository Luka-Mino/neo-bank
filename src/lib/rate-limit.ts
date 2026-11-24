// Rate limiting — adapted from Lawzy.
//
// Production: a fixed-window counter in Upstash Redis over its REST API (no
// SDK), so every server instance shares one count. On Vercel each function
// instance has its own memory, so an in-memory limiter alone lets an attacker
// spread login or 2FA guesses across instances (PRE-DAKOTA-PLAN C2).
//
// Local dev, or Upstash not configured or unreachable: the in-memory limiter.
// A failure falls back (requests are not blocked by a Redis outage) and raises
// an ops alert, at most once per ALERT_EVERY_MS per instance.
import { alertOps } from "@/lib/alerts";

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

type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };

const UPSTASH_TIMEOUT_MS = 1500;
const ALERT_EVERY_MS = 5 * 60 * 1000;
let lastAlertAt = 0;
let warnedMissing = false;

async function upstashRateLimit(
  url: string,
  token: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  // Fixed window: the window index is part of the key, so each window starts
  // from zero. PEXPIRE cleans the key up after its window.
  const windowIndex = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${windowIndex}`;
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, String(windowMs)],
    ]),
    signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  const count = Number(data?.[0]?.result);
  if (data?.[0]?.error || !Number.isFinite(count)) {
    throw new Error(`Upstash error: ${data?.[0]?.error ?? "bad response"}`);
  }
  const resetAt = (windowIndex + 1) * windowMs;
  return count > limit
    ? { allowed: false, remaining: 0, resetAt }
    : { allowed: true, remaining: Math.max(0, limit - count), resetAt };
}

export async function rateLimit(
  ip: string,
  limit = 20,
  windowMs = 60 * 60 * 1000
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === "production" && !warnedMissing) {
      warnedMissing = true;
      void alertOps("rate_limit_degraded", {
        reason: "UPSTASH_REDIS_REST_URL/TOKEN not set; using per-instance memory limits",
      });
    }
    return memoryRateLimit(ip, limit, windowMs);
  }
  try {
    return await upstashRateLimit(url, token, ip, limit, windowMs);
  } catch (e) {
    const now = Date.now();
    if (now - lastAlertAt > ALERT_EVERY_MS) {
      lastAlertAt = now;
      void alertOps("rate_limit_degraded", {
        reason: "Upstash unreachable; falling back to per-instance memory limits",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
    return memoryRateLimit(ip, limit, windowMs);
  }
}

/** Test hook: reset module state between tests. */
export function __resetRateLimitForTests() {
  memoryStore.clear();
  lastAlertAt = 0;
  warnedMissing = false;
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
