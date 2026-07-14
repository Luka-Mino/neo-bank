import { describe, expect, it } from "vitest";
import { screenPassword } from "./passwords";

describe("screenPassword", () => {
  it("rejects common passwords even if they meet char rules", () => {
    expect(screenPassword("Password1")).toBeTruthy();
    expect(screenPassword("Moneta2026")).toBeTruthy();
    expect(screenPassword("qwerty123")).toBeTruthy();
  });

  it("rejects repeats and sequences", () => {
    expect(screenPassword("aaaaaaaa")).toBeTruthy();
    expect(screenPassword("12345678")).toBeTruthy();
  });

  it("rejects passwords based on the email or name", () => {
    expect(screenPassword("alexrivera99", { email: "alexrivera@x.com" })).toBeTruthy();
    expect(screenPassword("jodavis2026", { name: "Jo Davis" })).toBeTruthy();
  });

  it("accepts a strong, unrelated password", () => {
    expect(screenPassword("Tr0ubadour-Kite$9", { email: "sam@x.com", name: "Sam" })).toBeNull();
  });
});
