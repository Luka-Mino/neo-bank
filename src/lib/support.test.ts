import { describe, expect, it } from "vitest";
import { escapeHtml, makeSupportReference, SUPPORT_CATEGORIES, supportRequestSchema } from "./support";

const valid = {
  category: "complaint" as const,
  subject: "Withdrawal hasn't arrived",
  message: "I withdrew $200 on Monday and it still isn't in my bank.",
};

describe("supportRequestSchema", () => {
  it("accepts a valid request, with or without a transaction", () => {
    expect(supportRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      supportRequestSchema.safeParse({ ...valid, transactionId: "11111111-1111-4111-8111-111111111111" }).success
    ).toBe(true);
  });

  it("rejects unknown fields, so a client can't set status or org", () => {
    expect(supportRequestSchema.safeParse({ ...valid, status: "resolved" }).success).toBe(false);
    expect(supportRequestSchema.safeParse({ ...valid, orgId: "x" }).success).toBe(false);
  });

  it("rejects a category outside the migration's CHECK list", () => {
    expect(supportRequestSchema.safeParse({ ...valid, category: "refund" }).success).toBe(false);
    expect(SUPPORT_CATEGORIES).toEqual(["question", "complaint", "card_dispute", "fraud"]);
  });

  it("rejects a malformed transaction id and over-long text", () => {
    expect(supportRequestSchema.safeParse({ ...valid, transactionId: "not-a-uuid" }).success).toBe(false);
    expect(supportRequestSchema.safeParse({ ...valid, subject: "x".repeat(121) }).success).toBe(false);
    expect(supportRequestSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success).toBe(false);
  });

  it("trims before checking minimum lengths", () => {
    expect(supportRequestSchema.safeParse({ ...valid, subject: "   a   " }).success).toBe(false);
  });
});

describe("makeSupportReference", () => {
  it("is SUP- plus 6 unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(makeSupportReference()).toMatch(/^SUP-[2-9A-HJKMNP-Z]{6}$/);
    }
  });
});

describe("escapeHtml", () => {
  it("neutralises markup from user text before it reaches the support inbox", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });
});
