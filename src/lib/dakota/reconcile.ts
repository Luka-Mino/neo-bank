import { and, asc, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { dakotaSyncState, webhookEvents } from "@/lib/db/schema";
import { alertOps } from "@/lib/alerts";
import { dakota } from "./client";
import type { DakotaEventEnvelope } from "./webhooks";
import { recordAndProcessEvent, type ProcessOutcome } from "./event-processing";

export type EventsOrder = "oldest" | "newest";

export interface FetchPageParams {
  startingAfter?: string;
  endingBefore?: string;
}

/**
 * Events reconciliation: the backstop for the webhook pipeline.
 *
 * Two phases, both idempotent:
 *  1. RETRY — re-run inbox rows that were seen but never processed (a
 *     handler threw on every Dakota delivery, or a previous sweep failed).
 *  2. SWEEP — pull `GET /events` from a stored cursor and feed anything we
 *     never saw through the same inbox contract webhooks use. Covers missed
 *     deliveries (Dakota stops retrying after 48h) and makes local dev work
 *     without a public webhook tunnel.
 *
 * Event IDs are KSUIDs — fixed-length base62, so lexicographic comparison
 * is creation-time ordering. The persistent cursor is the highest event id
 * ever seen (high-water mark), which stays correct regardless of the order
 * pages arrive in.
 */

const CURSOR_KEY = "dakota_events_cursor";
const DEFAULT_PAGE_LIMIT = 100; // API max
const DEFAULT_MAX_PAGES = 10;
// Don't retry inbox rows younger than this — the original delivery may
// still be in flight (harmless either way, but skip the duplicate work).
const RETRY_MIN_AGE_MS = 60_000;
const RETRY_BATCH = 200;

interface EventsPage {
  data?: DakotaEventEnvelope[];
  meta?: {
    total_count?: number;
    has_more_after?: boolean;
    has_more_before?: boolean;
  };
}

export interface SweepStats {
  pages: number;
  scanned: number;
  processed: number;
  ignored: number;
  alreadyProcessed: number;
  failed: number;
  /** New high-water cursor (highest event id seen), or the input cursor. */
  cursor: string | null;
  /**
   * True when a page arrived newest-first. The sweep assumes /events is an
   * oldest-first stream (the docs don't say); if this flags on the first
   * real sandbox run, pagination must flip to ending_before-style walking.
   */
  orderingSuspect: boolean;
}

export interface SweepDeps {
  fetchPage: (params: FetchPageParams, limit: number) => Promise<EventsPage>;
  processEvent: (
    envelope: DakotaEventEnvelope
  ) => Promise<{ outcome: ProcessOutcome }>;
}

export async function sweepNewEvents(
  deps: SweepDeps,
  opts: {
    cursor: string | null;
    maxPages?: number;
    pageLimit?: number;
    order?: EventsOrder;
  }
): Promise<SweepStats> {
  const maxPages = opts.maxPages ?? DEFAULT_MAX_PAGES;
  const pageLimit = opts.pageLimit ?? DEFAULT_PAGE_LIMIT;
  const order: EventsOrder = opts.order ?? "oldest";

  const stats: SweepStats = {
    pages: 0,
    scanned: 0,
    processed: 0,
    ignored: 0,
    alreadyProcessed: 0,
    failed: 0,
    cursor: opts.cursor,
    orderingSuspect: false,
  };

  // oldest-first: page forward with starting_after=lastId, follow has_more_after.
  // newest-first: page backward in time with ending_before=firstId, follow
  //   has_more_before — the high-water cursor still advances to the max id seen.
  let pageParams: FetchPageParams =
    order === "oldest"
      ? opts.cursor
        ? { startingAfter: opts.cursor }
        : {}
      : {};

  while (stats.pages < maxPages) {
    const page = await deps.fetchPage(pageParams, pageLimit);
    const items = page.data ?? [];
    if (items.length === 0) break;
    stats.pages++;

    const newestFirst =
      items.length > 1 && items[0].id > items[items.length - 1].id;
    // Only "suspect" when the observed order contradicts the configured one.
    if (
      (order === "oldest" && newestFirst) ||
      (order === "newest" && !newestFirst)
    ) {
      stats.orderingSuspect = true;
    }

    let reachedCursor = false;
    for (const envelope of items) {
      // In newest-first mode, stop once we page back to events we've already
      // seen (id <= stored cursor) — everything newer is now processed.
      if (order === "newest" && opts.cursor && envelope.id <= opts.cursor) {
        reachedCursor = true;
        break;
      }
      stats.scanned++;
      // A processEvent throw (DB down, etc.) aborts the sweep without
      // advancing the cursor — nothing is skipped; next run resumes here.
      const { outcome } = await deps.processEvent(envelope);
      if (outcome === "processed") stats.processed++;
      else if (outcome === "ignored") stats.ignored++;
      else if (outcome === "already_processed") stats.alreadyProcessed++;
      else stats.failed++; // row stays unprocessed → next run's retry phase

      if (stats.cursor === null || envelope.id > stats.cursor) {
        stats.cursor = envelope.id;
      }
    }

    // Stop if the observed order disagrees with config (avoid walking wrong).
    if (stats.orderingSuspect) break;

    if (order === "oldest") {
      if (!page.meta?.has_more_after) break;
      pageParams = { startingAfter: items[items.length - 1].id };
    } else {
      if (reachedCursor || !page.meta?.has_more_before) break;
      pageParams = { endingBefore: items[items.length - 1].id };
    }
  }

  return stats;
}

export interface RetryStats {
  attempted: number;
  processed: number;
  ignored: number;
  failed: number;
}

async function retryPendingEvents(): Promise<RetryStats> {
  const cutoff = new Date(Date.now() - RETRY_MIN_AGE_MS);
  const pending = await db
    .select({
      dakotaEventId: webhookEvents.dakotaEventId,
      eventType: webhookEvents.eventType,
      payload: webhookEvents.payload,
    })
    .from(webhookEvents)
    .where(and(isNull(webhookEvents.processedAt), lt(webhookEvents.createdAt, cutoff)))
    .orderBy(asc(webhookEvents.createdAt))
    .limit(RETRY_BATCH);

  const stats: RetryStats = { attempted: 0, processed: 0, ignored: 0, failed: 0 };
  for (const row of pending) {
    stats.attempted++;
    const { outcome } = await recordAndProcessEvent(
      row.payload as DakotaEventEnvelope,
      { eventId: row.dakotaEventId, eventType: row.eventType }
    );
    if (outcome === "processed" || outcome === "already_processed") stats.processed++;
    else if (outcome === "ignored") stats.ignored++;
    else stats.failed++;
  }
  return stats;
}

async function loadCursor(): Promise<string | null> {
  const [row] = await db
    .select({ value: dakotaSyncState.value })
    .from(dakotaSyncState)
    .where(eq(dakotaSyncState.key, CURSOR_KEY))
    .limit(1);
  return row?.value ?? null;
}

async function saveCursor(value: string): Promise<void> {
  await db
    .insert(dakotaSyncState)
    .values({ key: CURSOR_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: dakotaSyncState.key,
      set: { value, updatedAt: new Date() },
    });
}

export interface ReconcileResult {
  retry: RetryStats;
  sweep: SweepStats;
}

export async function reconcileEvents(opts?: {
  maxPages?: number;
}): Promise<ReconcileResult> {
  const retry = await retryPendingEvents();

  const cursor = await loadCursor();
  // Ordering of GET /events is undocumented. Default to oldest-first
  // pagination (starting_after walks forward). If a run detects a
  // newest-first page, we alert; set DAKOTA_EVENTS_ORDER=newest to switch
  // the sweep to ending_before pagination once the sandbox confirms it.
  const order = process.env.DAKOTA_EVENTS_ORDER === "newest" ? "newest" : "oldest";
  const sweep = await sweepNewEvents(
    {
      fetchPage: ({ startingAfter, endingBefore }, limit) =>
        dakota.get<EventsPage>("/events", {
          limit: String(limit),
          ...(startingAfter ? { starting_after: startingAfter } : {}),
          ...(endingBefore ? { ending_before: endingBefore } : {}),
        }),
      processEvent: (envelope) => recordAndProcessEvent(envelope),
    },
    { cursor, maxPages: opts?.maxPages, order }
  );

  if (sweep.orderingSuspect) {
    await alertOps("reconcile_failed", {
      reason:
        "GET /events returned a newest-first page while sweeping oldest-first; " +
        "set DAKOTA_EVENTS_ORDER=newest once confirmed against the sandbox",
      cursor: sweep.cursor,
    });
  }

  if (sweep.cursor && sweep.cursor !== cursor) {
    await saveCursor(sweep.cursor);
  }

  return { retry, sweep };
}
