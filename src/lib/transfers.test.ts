import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { addPeriod } from "./transfers";

describe("addPeriod", () => {
  it("adds weeks", () => {
    expect(addPeriod(new Date("2026-07-12T09:00:00Z"), "weekly").toISOString())
      .toBe("2026-07-19T09:00:00.000Z");
    expect(addPeriod(new Date("2026-07-12T09:00:00Z"), "biweekly").toISOString())
      .toBe("2026-07-26T09:00:00.000Z");
  });

  it("adds a month keeping the day", () => {
    expect(addPeriod(new Date("2026-07-15T09:00:00Z"), "monthly").getUTCDate()).toBe(15);
  });

  it("clamps month-end days", () => {
    const next = addPeriod(new Date("2026-01-31T12:00:00Z"), "monthly");
    expect(next.getMonth()).toBe(1); // February
    expect(next.getDate()).toBeLessThanOrEqual(29);
  });
});
