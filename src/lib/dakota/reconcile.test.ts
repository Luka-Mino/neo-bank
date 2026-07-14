import { describe, expect, it, vi } from "vitest";

// reconcile.ts (and its handler imports) reach @/lib/db, which opens a
// Postgres connection at import time. sweepNewEvents never touches it —
// its deps are injected — so stub the module out.
vi.mock("@/lib/db", () => ({ db: {} }));

import { sweepNewEvents, type SweepDeps } from "./reconcile";
import type { DakotaEventEnvelope } from "./webhooks";
import type { ProcessOutcome } from "./event-processing";

function evt(id: string, type = "transaction.auto.updated"): DakotaEventEnvelope {
  return {
    id,
    type,
    created: 1751980000,
    api_version: "1.0.0",
    data: { object: { id: `tx_${id}` } },
  };
}

function deps(
  pages: Array<{ data: DakotaEventEnvelope[]; has_more_after?: boolean }>,
  outcome: ProcessOutcome = "processed"
) {
  const fetchPage = vi.fn(async (_params: { startingAfter?: string; endingBefore?: string }, limit: number) => {
    void limit;
    const page = pages.shift() ?? { data: [] };
    return { data: page.data, meta: { has_more_after: page.has_more_after ?? false } };
  });
  const processEvent = vi.fn(async (_e: DakotaEventEnvelope) => ({ outcome }));
  return { fetchPage, processEvent } satisfies SweepDeps & {
    fetchPage: ReturnType<typeof vi.fn>;
    processEvent: ReturnType<typeof vi.fn>;
  };
}

describe("sweepNewEvents", () => {
  it("processes every event and advances the cursor to the max id", async () => {
    const d = deps([{ data: [evt("0001"), evt("0002"), evt("0003")] }]);
    const stats = await sweepNewEvents(d, { cursor: null });

    expect(d.processEvent).toHaveBeenCalledTimes(3);
    expect(stats).toMatchObject({
      pages: 1,
      scanned: 3,
      processed: 3,
      failed: 0,
      cursor: "0003",
      orderingSuspect: false,
    });
  });

  it("passes the stored cursor to the first page and chains pages via last id", async () => {
    const d = deps([
      { data: [evt("0004"), evt("0005")], has_more_after: true },
      { data: [evt("0006")] },
    ]);
    const stats = await sweepNewEvents(d, { cursor: "0003" });

    expect(d.fetchPage).toHaveBeenNthCalledWith(1, { startingAfter: "0003" }, 100);
    expect(d.fetchPage).toHaveBeenNthCalledWith(2, { startingAfter: "0005" }, 100);
    expect(stats.cursor).toBe("0006");
    expect(stats.pages).toBe(2);
  });

  it("stops at maxPages even when more pages exist", async () => {
    const d = deps([
      { data: [evt("0001")], has_more_after: true },
      { data: [evt("0002")], has_more_after: true },
      { data: [evt("0003")], has_more_after: true },
    ]);
    const stats = await sweepNewEvents(d, { cursor: null, maxPages: 2 });

    expect(stats.pages).toBe(2);
    expect(stats.cursor).toBe("0002");
  });

  it("keeps the input cursor when there are no new events", async () => {
    const d = deps([{ data: [] }]);
    const stats = await sweepNewEvents(d, { cursor: "0042" });

    expect(stats.cursor).toBe("0042");
    expect(stats.pages).toBe(0);
    expect(d.processEvent).not.toHaveBeenCalled();
  });

  it("counts failures and keeps sweeping (retry phase owns them)", async () => {
    const d = deps([{ data: [evt("0001"), evt("0002")] }], "failed");
    const stats = await sweepNewEvents(d, { cursor: null });

    expect(stats.failed).toBe(2);
    expect(stats.cursor).toBe("0002"); // cursor still advances
  });

  it("flags newest-first pages and stops instead of walking history", async () => {
    const d = deps([
      { data: [evt("0009"), evt("0008"), evt("0007")], has_more_after: true },
      { data: [evt("0006")] },
    ]);
    const stats = await sweepNewEvents(d, { cursor: null });

    expect(stats.orderingSuspect).toBe(true);
    expect(stats.pages).toBe(1); // did not chase the second page
    expect(stats.cursor).toBe("0009"); // high-water mark, not last item
  });

  it("propagates processEvent throws without advancing past the failure", async () => {
    const d = deps([{ data: [evt("0001")] }]);
    d.processEvent.mockRejectedValueOnce(new Error("db down"));

    await expect(sweepNewEvents(d, { cursor: null })).rejects.toThrow("db down");
  });
});
