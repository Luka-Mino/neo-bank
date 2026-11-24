import { describe, expect, it } from "vitest";
import {
  IDLE_TIMEOUT_S,
  isSessionTooOld,
  MAX_SESSION_S,
  REFRESH_EVERY_MS,
  shouldRefresh,
  timeoutState,
} from "./session-policy";

const T0 = Date.UTC(2026, 10, 24, 12, 0, 0);
const authTimeS = T0 / 1000;
const min = 60 * 1000;

describe("session policy constants", () => {
  it("is 2 hours absolute and 30 minutes idle", () => {
    expect(MAX_SESSION_S).toBe(7200);
    expect(IDLE_TIMEOUT_S).toBe(1800);
    // Refreshing well inside the idle window keeps an active user signed in.
    expect(REFRESH_EVERY_MS).toBeLessThan(IDLE_TIMEOUT_S * 1000);
  });
});

describe("isSessionTooOld (server, every request)", () => {
  it("allows up to 2 hours after sign-in", () => {
    expect(isSessionTooOld(authTimeS, T0 + 119 * min)).toBe(false);
    expect(isSessionTooOld(authTimeS, T0 + 120 * min)).toBe(true);
  });

  it("treats a token without a sign-in time as expired", () => {
    expect(isSessionTooOld(undefined, T0)).toBe(true);
    expect(isSessionTooOld(Number.NaN, T0)).toBe(true);
  });
});

describe("timeoutState (browser)", () => {
  it("stays active with recent activity", () => {
    expect(timeoutState({ authTimeS, lastActivityMs: T0 + 10 * min, nowMs: T0 + 20 * min })).toBe("active");
  });

  it("signs out after 30 minutes without activity", () => {
    expect(timeoutState({ authTimeS, lastActivityMs: T0, nowMs: T0 + 29 * min })).toBe("active");
    expect(timeoutState({ authTimeS, lastActivityMs: T0, nowMs: T0 + 30 * min })).toBe("idle");
  });

  it("warns 5 minutes before the 2-hour limit, then ends the session", () => {
    expect(timeoutState({ authTimeS, lastActivityMs: T0 + 114 * min, nowMs: T0 + 115 * min })).toBe("warn_max");
    expect(timeoutState({ authTimeS, lastActivityMs: T0 + 119 * min, nowMs: T0 + 120 * min })).toBe("max");
  });

  it("the 2-hour limit wins over idle", () => {
    expect(timeoutState({ authTimeS, lastActivityMs: T0, nowMs: T0 + 3 * 60 * min })).toBe("max");
  });
});

describe("shouldRefresh", () => {
  it("re-issues the session at most every 5 minutes", () => {
    expect(shouldRefresh(T0, T0 + 4 * min)).toBe(false);
    expect(shouldRefresh(T0, T0 + 5 * min)).toBe(true);
  });
});
