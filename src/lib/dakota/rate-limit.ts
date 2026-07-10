/**
 * Client-side pacing + retry math for the Dakota API.
 *
 * Dakota enforces 60 requests/min per API key. We self-throttle below that
 * so bursts (balance fans-out, provisioning pipelines) queue locally instead
 * of burning the key budget and eating 429s. This limiter is in-process only:
 * with multiple server instances each gets its own window, so keep the
 * per-process limit conservative.
 */

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export class SlidingWindowLimiter {
  private timestamps: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private limit: number,
    private windowMs: number,
    private now: () => number = Date.now,
    private sleep: (ms: number) => Promise<void> = defaultSleep
  ) {}

  /**
   * Resolves when the caller may send a request. Acquisitions are serialized
   * so concurrent callers line up instead of all measuring the same window
   * and bursting through together.
   */
  acquire(): Promise<void> {
    const turn = this.queue.then(async () => {
      for (;;) {
        const cutoff = this.now() - this.windowMs;
        this.timestamps = this.timestamps.filter((t) => t > cutoff);
        if (this.timestamps.length < this.limit) {
          this.timestamps.push(this.now());
          return;
        }
        // Wait for the oldest request to age out of the window.
        this.timestamps.sort((a, b) => a - b);
        await this.sleep(this.timestamps[0] + this.windowMs - this.now() + 1);
      }
    });
    // Swallow rejection on the chain so one aborted waiter can't wedge the queue.
    this.queue = turn.catch(() => {});
    return turn;
  }
}

export interface RetryPolicy {
  /** Retries after the first attempt (3 → up to 4 attempts total). */
  maxRetries: number;
  baseDelayMs: number;
  /** Per-attempt delay ceiling; a Retry-After beyond this fails fast. */
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 15_000,
};

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/** Parses Retry-After as delta-seconds or HTTP-date. Returns ms, or null. */
export function parseRetryAfter(
  header: string | null,
  now: () => number = Date.now
): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  if (Number.isNaN(date)) return null;
  return Math.max(0, date - now());
}

/**
 * Delay before retry `attempt` (0-based). Retry-After wins when present;
 * otherwise exponential backoff with full jitter. Returns null when the
 * server asked us to wait longer than the policy allows — fail fast rather
 * than hold a request handler open.
 */
export function computeRetryDelayMs(
  attempt: number,
  retryAfterMs: number | null,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  random: () => number = Math.random
): number | null {
  if (retryAfterMs !== null) {
    return retryAfterMs <= policy.maxDelayMs ? retryAfterMs : null;
  }
  const exp = policy.baseDelayMs * 2 ** attempt;
  const capped = Math.min(exp, policy.maxDelayMs);
  return Math.round(capped / 2 + random() * (capped / 2));
}
