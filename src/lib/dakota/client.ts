import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_RETRY_POLICY,
  SlidingWindowLimiter,
  computeRetryDelayMs,
  isRetryableStatus,
  parseRetryAfter,
  type RetryPolicy,
} from "./rate-limit";

const DAKOTA_BASE_URLS = {
  sandbox: "https://api.platform.sandbox.dakota.xyz",
  production: "https://api.platform.dakota.xyz",
} as const;

type DakotaEnv = keyof typeof DAKOTA_BASE_URLS;

function getBaseUrl(): string {
  const env = (process.env.DAKOTA_ENV || "sandbox") as DakotaEnv;
  return DAKOTA_BASE_URLS[env];
}

function getApiKey(): string {
  const key = process.env.DAKOTA_API_KEY;
  if (!key) throw new Error("DAKOTA_API_KEY is not configured");
  return key;
}

export class DakotaApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public detail: string,
    public errors?: Array<{ field: string; message: string; code: string }>
  ) {
    super(`Dakota API Error (${status}): ${detail}`);
    this.name = "DakotaApiError";
  }
}

// Dakota allows 60 req/min per key; stay under it so retries and parallel
// requests have headroom. In-process only — lower this if we ever run more
// than one server instance against the same key.
const REQUESTS_PER_MINUTE = 55;
const limiter = new SlidingWindowLimiter(REQUESTS_PER_MINUTE, 60_000);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, string>;
  body?: unknown;
  idempotencyKey?: string;
  /**
   * Which failures to retry. POSTs carry an idempotency key (Dakota replays
   * the cached response), so a repeat is always safe. PATCH/DELETE have no
   * such key and a 5xx may have applied — for those only 429 (definitely not
   * executed) is retried.
   */
  retryOn: "retryable" | "rate-limit-only";
}

async function request<T>(
  opts: RequestOptions,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<T> {
  const url = new URL(`${getBaseUrl()}${opts.path}`);
  if (opts.params) {
    Object.entries(opts.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = { "x-api-key": getApiKey() };
  if (opts.method === "POST") {
    // Generated ONCE per logical call, not per attempt — retries must reuse
    // the key so Dakota replays instead of creating duplicate resources.
    headers["x-idempotency-key"] = opts.idempotencyKey ?? uuidv4();
  }
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const init: RequestInit = {
    method: opts.method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };

  for (let attempt = 0; ; attempt++) {
    await limiter.acquire();

    let response: Response;
    try {
      response = await fetch(url.toString(), init);
    } catch (err) {
      // Network-level failure: nothing reached Dakota's application layer
      // conclusively; safe to retry within the same rules as 5xx.
      if (opts.retryOn === "retryable" && attempt < policy.maxRetries) {
        const delay = computeRetryDelayMs(attempt, null, policy);
        if (delay !== null) {
          await sleep(delay);
          continue;
        }
      }
      throw err;
    }

    if (response.ok) {
      if (response.status === 204) return undefined as T;
      return response.json();
    }

    const retryable =
      opts.retryOn === "retryable"
        ? isRetryableStatus(response.status)
        : response.status === 429;

    if (retryable && attempt < policy.maxRetries) {
      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      const delay = computeRetryDelayMs(attempt, retryAfterMs, policy);
      if (delay !== null) {
        await sleep(delay);
        continue;
      }
    }

    const body = await response.json().catch(() => ({}));
    throw new DakotaApiError(
      response.status,
      body.type || "unknown",
      body.detail || response.statusText,
      body.errors
    );
  }
}

export const dakota = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return request<T>({ method: "GET", path, params, retryOn: "retryable" });
  },

  async post<T>(
    path: string,
    body?: unknown,
    opts?: { idempotencyKey?: string }
  ): Promise<T> {
    return request<T>({
      method: "POST",
      path,
      body,
      idempotencyKey: opts?.idempotencyKey,
      retryOn: "retryable",
    });
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>({ method: "PATCH", path, body, retryOn: "rate-limit-only" });
  },

  async delete<T = void>(path: string): Promise<T> {
    return request<T>({ method: "DELETE", path, retryOn: "rate-limit-only" });
  },
};
