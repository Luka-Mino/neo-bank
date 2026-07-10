import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETRY_POLICY,
  SlidingWindowLimiter,
  computeRetryDelayMs,
  isRetryableStatus,
  parseRetryAfter,
} from "./rate-limit";

describe("parseRetryAfter", () => {
  it("parses delta-seconds", () => {
    expect(parseRetryAfter("2")).toBe(2000);
    expect(parseRetryAfter("0")).toBe(0);
  });

  it("parses HTTP-date relative to now", () => {
    const now = Date.parse("2026-07-10T12:00:00Z");
    const header = new Date(now + 5000).toUTCString();
    const ms = parseRetryAfter(header, () => now);
    // toUTCString drops sub-second precision
    expect(ms).toBeGreaterThanOrEqual(4000);
    expect(ms).toBeLessThanOrEqual(5000);
  });

  it("clamps past dates to zero", () => {
    const now = Date.parse("2026-07-10T12:00:00Z");
    const header = new Date(now - 5000).toUTCString();
    expect(parseRetryAfter(header, () => now)).toBe(0);
  });

  it("returns null for absent or garbage headers", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("soon")).toBeNull();
  });
});

describe("computeRetryDelayMs", () => {
  it("honors Retry-After within the cap", () => {
    expect(computeRetryDelayMs(0, 3000)).toBe(3000);
  });

  it("fails fast when Retry-After exceeds the cap", () => {
    expect(
      computeRetryDelayMs(0, DEFAULT_RETRY_POLICY.maxDelayMs + 1)
    ).toBeNull();
  });

  it("backs off exponentially with jitter bounded by the attempt window", () => {
    const min = (attempt: number) =>
      computeRetryDelayMs(attempt, null, DEFAULT_RETRY_POLICY, () => 0)!;
    const max = (attempt: number) =>
      computeRetryDelayMs(attempt, null, DEFAULT_RETRY_POLICY, () => 0.999999)!;
    expect(min(0)).toBe(250); // 500/2
    expect(min(1)).toBe(500); // 1000/2
    expect(max(0)).toBeLessThanOrEqual(500);
    expect(max(3)).toBeLessThanOrEqual(4000);
  });

  it("caps the exponential term at maxDelayMs", () => {
    const d = computeRetryDelayMs(20, null, DEFAULT_RETRY_POLICY, () => 0.5)!;
    expect(d).toBeLessThanOrEqual(DEFAULT_RETRY_POLICY.maxDelayMs);
  });
});

describe("isRetryableStatus", () => {
  it("retries 429 and 5xx gateway/server errors only", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(422)).toBe(false);
  });
});

describe("SlidingWindowLimiter", () => {
  function fakeClock() {
    let t = 0;
    return {
      now: () => t,
      sleep: (ms: number) => {
        t += ms;
        return Promise.resolve();
      },
      time: () => t,
    };
  }

  it("lets requests through until the window is full", async () => {
    const clock = fakeClock();
    const limiter = new SlidingWindowLimiter(3, 1000, clock.now, clock.sleep);
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    expect(clock.time()).toBe(0); // no waiting
  });

  it("delays the request that exceeds the window", async () => {
    const clock = fakeClock();
    const limiter = new SlidingWindowLimiter(2, 1000, clock.now, clock.sleep);
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire(); // must wait for slot 1 to age out
    expect(clock.time()).toBeGreaterThanOrEqual(1000);
  });

  it("serializes concurrent acquisitions instead of bursting", async () => {
    const clock = fakeClock();
    const limiter = new SlidingWindowLimiter(2, 1000, clock.now, clock.sleep);
    await Promise.all([
      limiter.acquire(),
      limiter.acquire(),
      limiter.acquire(),
      limiter.acquire(),
    ]);
    // 4 acquisitions through a 2/window limiter → at least one full window elapsed
    expect(clock.time()).toBeGreaterThanOrEqual(1000);
  });
});
