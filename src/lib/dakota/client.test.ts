import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DakotaApiError, dakota } from "./client";

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("dakota client retry behavior", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    process.env.DAKOTA_API_KEY = "test-key";
    process.env.DAKOTA_ENV = "sandbox";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  /** Runs a client call while advancing fake timers until it settles. */
  async function settle<T>(promise: Promise<T>): Promise<T> {
    const wrapped = promise.then(
      (v) => ({ ok: true as const, v }),
      (e) => ({ ok: false as const, e })
    );
    // Generous ceiling: enough for maxRetries at maxDelayMs
    await vi.advanceTimersByTimeAsync(120_000);
    const result = await wrapped;
    if (result.ok) return result.v;
    throw result.e;
  }

  it("retries POST on 429 honoring Retry-After and reuses the idempotency key", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(429, { detail: "rate limited" }, { "Retry-After": "1" })
      )
      .mockResolvedValueOnce(jsonResponse(200, { id: "cus_1" }));

    const result = await settle(dakota.post<{ id: string }>("/customers", { name: "a" }));

    expect(result.id).toBe("cus_1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const key1 = (fetchMock.mock.calls[0][1]!.headers as Record<string, string>)[
      "x-idempotency-key"
    ];
    const key2 = (fetchMock.mock.calls[1][1]!.headers as Record<string, string>)[
      "x-idempotency-key"
    ];
    expect(key1).toBeTruthy();
    expect(key1).toBe(key2);
  });

  it("retries GET on 503 with backoff", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(503, { detail: "unavailable" }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [] }));

    const result = await settle(dakota.get<{ items: unknown[] }>("/events"));
    expect(result.items).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries on network errors", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await settle(dakota.get<{ ok: boolean }>("/customers"));
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry 4xx client errors", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, {
        type: "validation_error",
        detail: "bad field",
        errors: [{ field: "name", message: "required", code: "required" }],
      })
    );

    await expect(settle(dakota.post("/customers", {}))).rejects.toMatchObject({
      status: 400,
      type: "validation_error",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry PATCH on 500 (result ambiguous, no idempotency key)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { detail: "boom" }));

    await expect(
      settle(dakota.patch("/customers/cus_1", { name: "b" }))
    ).rejects.toBeInstanceOf(DakotaApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries PATCH on 429 (request never executed)", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(429, { detail: "slow down" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "cus_1" }));

    const result = await settle(dakota.patch<{ id: string }>("/customers/cus_1", {}));
    expect(result.id).toBe("cus_1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails fast when Retry-After exceeds the delay cap", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(429, { detail: "rate limited" }, { "Retry-After": "600" })
    );

    await expect(settle(dakota.get("/events"))).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after exhausting retries", async () => {
    fetchMock.mockResolvedValue(jsonResponse(503, { detail: "down" }));

    await expect(settle(dakota.get("/events"))).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(4); // 1 + maxRetries(3)
  });
});
