import { describe, expect, it, vi } from "vitest";

vi.mock("resend", () => ({ Resend: class {} }));
vi.mock("@/lib/logger", () => ({ logger: { error: () => {}, info: () => {} } }));

import { isEmailDeliverable } from "./email";

describe("isEmailDeliverable (gates email-verification enforcement)", () => {
  it("is false with no transport", () => {
    expect(isEmailDeliverable({})).toBe(false);
  });
  it("is true with Resend", () => {
    expect(isEmailDeliverable({ RESEND_API_KEY: "re_x" })).toBe(true);
  });
  it("is true with SMTP only (previously missed)", () => {
    expect(isEmailDeliverable({ SMTP_URL: "smtp://u:p@host:587" })).toBe(true);
    expect(isEmailDeliverable({ EMAIL_PROVIDER: "smtp", SMTP_URL: "smtp://u:p@host:587" })).toBe(true);
  });
  it("is false when the chosen provider has no credentials", () => {
    expect(isEmailDeliverable({ EMAIL_PROVIDER: "resend", SMTP_URL: "smtp://u:p@host:587" })).toBe(false);
    expect(isEmailDeliverable({ EMAIL_PROVIDER: "smtp" })).toBe(false);
  });
});
