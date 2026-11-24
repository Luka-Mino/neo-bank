import { describe, expect, it } from "vitest";
import { scrubBreadcrumb, scrubEvent, scrubMessage, scrubUrl } from "./sentry-scrub";

describe("scrubUrl", () => {
  it("redacts secret query values and keeps the rest", () => {
    expect(scrubUrl("https://app.moneta.test/magic?token=abc123&next=/app")).toBe(
      "https://app.moneta.test/magic?token=[redacted]&next=/app"
    );
    expect(scrubUrl("/reset-password?token=t0k3n")).toBe("/reset-password?token=[redacted]");
    expect(scrubUrl("/verify-email?TOKEN=x")).toBe("/verify-email?TOKEN=[redacted]");
  });

  it("redacts the Cards.js session parameter", () => {
    expect(scrubUrl("https://cards.example/frame?session=s_live_123&theme=dark")).toBe(
      "https://cards.example/frame?session=[redacted]&theme=dark"
    );
  });

  it("handles bare query strings and fragments", () => {
    expect(scrubUrl("code=123456&x=1")).toBe("code=[redacted]&x=1");
    expect(scrubUrl("/cb?x=1#access_token=abc")).toBe("/cb?x=1#[redacted]");
  });

  it("removes emails from paths and values", () => {
    expect(scrubUrl("/login?email=a%40b.com&callbackUrl=%2Fapp")).toBe("/login?email=[redacted]&callbackUrl=[redacted]");
    expect(scrubUrl("/users/a.person@example.com/profile")).toBe("/users/[email]/profile");
  });
});

describe("scrubMessage", () => {
  it("removes emails, bearer tokens and long digit runs", () => {
    expect(scrubMessage("Failed for jo@x.io with Bearer eyJhbGciOi.xyz on acct 123456789")).toBe(
      "Failed for [email] with Bearer [redacted] on acct [digits]"
    );
  });
});

describe("scrubEvent", () => {
  it("cleans request, user, exception, extra and breadcrumbs", () => {
    const event = {
      message: "user jo@x.io failed",
      transaction: "/magic?token=abc",
      request: {
        url: "https://app/x?token=abc&ok=1",
        query_string: "session=s1&ok=1",
        headers: { Authorization: "Bearer abc", "X-Dakota-Signature": "sig", Accept: "json" },
        cookies: { "authjs.session-token": "jwt" },
        data: { password: "hunter2" },
      },
      user: { id: "u1", email: "jo@x.io", ip_address: "1.2.3.4" },
      exception: { values: [{ value: "Card 4111111111111111 declined for jo@x.io" }] },
      extra: { token: "abc", nested: { email: "jo@x.io", url: "/invite?token=zzz" } },
      breadcrumbs: [{ message: "GET /magic?token=abc", data: { url: "/magic?token=abc" } }],
    };
    const out = scrubEvent(event);
    expect(out.message).toBe("user [email] failed");
    expect(out.transaction).toBe("/magic?token=[redacted]");
    expect(out.request.url).toBe("https://app/x?token=[redacted]&ok=1");
    expect(out.request.query_string).toBe("session=[redacted]&ok=1");
    expect(out.request.headers).toEqual({ Authorization: "[redacted]", "X-Dakota-Signature": "[redacted]", Accept: "json" });
    expect("cookies" in out.request).toBe(false);
    expect("data" in out.request).toBe(false);
    expect(out.user).toEqual({ id: "u1" });
    expect(out.exception.values[0].value).toBe("Card [digits] declined for [email]");
    expect(out.extra).toEqual({ token: "[redacted]", nested: { email: "[redacted]", url: "/invite?token=[redacted]" } });
    expect(out.breadcrumbs[0]).toEqual({ message: "GET /magic?token=[redacted]", data: { url: "/magic?token=[redacted]" } });
  });

  it("leaves an event without sensitive data unchanged in shape", () => {
    const out = scrubEvent({ message: "boom", tags: { route: "/app" } });
    expect(out).toEqual({ message: "boom", tags: { route: "/app" } });
  });
});

describe("scrubBreadcrumb", () => {
  it("scrubs navigation from/to and fetch urls", () => {
    const b = scrubBreadcrumb({ category: "navigation", data: { from: "/magic?token=a", to: "/app" } });
    expect(b.data).toEqual({ from: "/magic?token=[redacted]", to: "/app" });
  });
});
