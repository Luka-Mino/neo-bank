// Shared rate limiting (PRE-DAKOTA-PLAN C2): with Upstash configured, counts
// live in Redis, so separate server instances share one budget; without it, or
// when Upstash is down, the per-instance memory limiter takes over and ops
// are alerted.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const alerts: { alert: string; ctx: Record<string, unknown> }[] = [];
vi.mock("@/lib/alerts", () => ({
  alertOps: async (alert: string, ctx: Record<string, unknown>) => {
    alerts.push({ alert, ctx });
  },
}));

import { __resetRateLimitForTests, rateLimit } from "./rate-limit";

// A fake Upstash: one shared store, like Redis behind every instance.
function fakeUpstash() {
  const store = new Map<string, number>();
  const calls: string[][][] = [];
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const cmds = JSON.parse(String(init.body)) as string[][];
    calls.push(cmds);
    const out = cmds.map(([op, key]) => {
      if (op === "INCR") {
        const n = (store.get(key) ?? 0) + 1;
        store.set(key, n);
        return { result: n };
      }
      return { result: 1 };
    });
    return new Response(JSON.stringify(out), { status: 200 });
  });
  return { store, calls, fetchMock };
}

describe("rateLimit", () => {
  const env = { ...process.env };

  beforeEach(() => {
    __resetRateLimitForTests();
    alerts.length = 0;
  });
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("counts in Upstash, so the budget is shared rather than per instance", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    const up = fakeUpstash();
    vi.stubGlobal("fetch", up.fetchMock);

    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("login:a@x.test", 3, 60_000));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);

    // The counter lives in the shared store, not in this process.
    __resetRateLimitForTests(); // a "fresh instance" with empty memory
    expect((await rateLimit("login:a@x.test", 3, 60_000)).allowed).toBe(false);

    const [first] = up.calls[0];
    expect(first[0]).toBe("INCR");
    expect(first[1]).toMatch(/^rl:login:a@x\.test:\d+$/);
    expect(up.fetchMock.mock.calls[0][0]).toBe("https://example.upstash.io/pipeline");
    expect(alerts).toHaveLength(0);
  });

  it("keeps separate keys separate", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    vi.stubGlobal("fetch", fakeUpstash().fetchMock);
    expect((await rateLimit("k1", 1, 60_000)).allowed).toBe(true);
    expect((await rateLimit("k2", 1, 60_000)).allowed).toBe(true);
    expect((await rateLimit("k1", 1, 60_000)).allowed).toBe(false);
  });

  it("falls back to memory and alerts (once) when Upstash is down", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));

    const r1 = await rateLimit("k", 2, 60_000);
    const r2 = await rateLimit("k", 2, 60_000);
    const r3 = await rateLimit("k", 2, 60_000);
    expect([r1.allowed, r2.allowed, r3.allowed]).toEqual([true, true, false]); // memory still limits
    expect(alerts.filter((a) => a.alert === "rate_limit_degraded")).toHaveLength(1);
  });

  it("uses memory without Upstash; alerts in production only", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect((await rateLimit("k", 1, 60_000)).allowed).toBe(true);
    expect((await rateLimit("k", 1, 60_000)).allowed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(alerts).toHaveLength(0); // NODE_ENV is "test"

    __resetRateLimitForTests();
    vi.stubEnv("NODE_ENV", "production");
    await rateLimit("k", 1, 60_000);
    await rateLimit("k", 1, 60_000);
    vi.unstubAllEnvs();
    expect(alerts.filter((a) => a.alert === "rate_limit_degraded")).toHaveLength(1);
  });
});
