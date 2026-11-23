import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DakotaApiError } from "./client";
import {
  createRevealSession,
  mapDakotaCardStatus,
  problemSlug,
  setCardStatus,
} from "./cards";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Dakota Cards API wrappers", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    process.env.DAKOTA_API_KEY = "test-key";
    process.env.DAKOTA_ENV = "sandbox";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reveal_session sends NO idempotency key and the exact body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { session: "s_1", expires_at: "2026-11-23T12:00:00Z" })
    );
    const res = await createRevealSession("card_1", "https://app.example.com");
    expect(res.session).toBe("s_1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.platform.sandbox.dakota.xyz/cards/card_1/reveal_session"
    );
    const headers = init!.headers as Record<string, string>;
    expect(headers["x-idempotency-key"]).toBeUndefined();
    expect(JSON.parse(String(init!.body))).toEqual({
      session_type: "card_details",
      origin: "https://app.example.com",
    });
  });

  it("reveal_session is not retried on a 5xx (no idempotency key to make it safe)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(502, { type: "https://docs.dakota.xyz/api-reference/errors#bad-gateway", detail: "x" })
    );
    await expect(createRevealSession("card_1", "https://app.example.com")).rejects.toBeInstanceOf(
      DakotaApiError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("card PATCH carries the caller's idempotency key", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { id: "card_1", status: "frozen", version: 4 })
    );
    const card = await setCardStatus("card_1", "frozen", "11111111-1111-4111-8111-111111111111");
    expect(card.version).toBe(4);
    const [, init] = fetchMock.mock.calls[0];
    expect(init!.method).toBe("PATCH");
    expect((init!.headers as Record<string, string>)["x-idempotency-key"]).toBe(
      "11111111-1111-4111-8111-111111111111"
    );
    expect(JSON.parse(String(init!.body))).toEqual({ status: "frozen" });
  });
});

describe("problemSlug", () => {
  it("returns the slug after # in the problem type", () => {
    const e = new DakotaApiError(
      409,
      "https://docs.dakota.xyz/api-reference/errors#cardholder-already-exists",
      "exists"
    );
    expect(problemSlug(e)).toBe("cardholder-already-exists");
  });

  it("returns null for non-Dakota errors", () => {
    expect(problemSlug(new Error("boom"))).toBeNull();
  });
});

describe("mapDakotaCardStatus", () => {
  it("maps Dakota statuses onto Moneta's vocabulary", () => {
    expect(mapDakotaCardStatus("pending")).toBe("pending");
    expect(mapDakotaCardStatus("active")).toBe("active");
    expect(mapDakotaCardStatus("frozen")).toBe("frozen");
    expect(mapDakotaCardStatus("overdrawn")).toBe("frozen");
    expect(mapDakotaCardStatus("closed")).toBe("canceled");
  });
});
