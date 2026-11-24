import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth";

const base = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "Analytical1",
  confirmPassword: "Analytical1",
};

describe("registerSchema: Moneta Terms and Privacy acceptance (plan 1c.2)", () => {
  it("accepts a sign-up that ticked the box", () => {
    expect(registerSchema.safeParse({ ...base, acceptTerms: true }).success).toBe(true);
  });

  it("rejects an unticked box with a readable message", () => {
    const r = registerSchema.safeParse({ ...base, acceptTerms: false });
    expect(r.success).toBe(false);
    const issue = r.error!.issues.find((i) => i.path[0] === "acceptTerms");
    expect(issue?.message).toMatch(/Terms and Privacy/);
  });

  it("rejects a sign-up that omits the field (old clients)", () => {
    expect(registerSchema.safeParse(base).success).toBe(false);
  });

  it("does not accept a truthy string in place of true", () => {
    expect(registerSchema.safeParse({ ...base, acceptTerms: "true" }).success).toBe(false);
  });
});
