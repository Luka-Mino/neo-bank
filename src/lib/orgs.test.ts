import { describe, expect, it } from "vitest";
import { ROLE_RANK, roleSatisfies, type Role } from "@/lib/orgs";

describe("role lattice", () => {
  it("ranks owner > admin > member > viewer", () => {
    expect(ROLE_RANK.owner).toBeGreaterThan(ROLE_RANK.admin);
    expect(ROLE_RANK.admin).toBeGreaterThan(ROLE_RANK.member);
    expect(ROLE_RANK.member).toBeGreaterThan(ROLE_RANK.viewer);
  });

  it("roleSatisfies: a role meets its own and lower requirements", () => {
    expect(roleSatisfies("admin", "admin")).toBe(true);
    expect(roleSatisfies("admin", "member")).toBe(true);
    expect(roleSatisfies("owner", "admin")).toBe(true);
    expect(roleSatisfies("owner", "viewer")).toBe(true);
  });

  it("roleSatisfies: a lower role does NOT meet a higher requirement (fail-closed)", () => {
    expect(roleSatisfies("member", "admin")).toBe(false);
    expect(roleSatisfies("viewer", "member")).toBe(false);
    expect(roleSatisfies("admin", "owner")).toBe(false);
  });

  it("roleSatisfies: undefined role never satisfies anything", () => {
    expect(roleSatisfies(undefined, "viewer")).toBe(false);
    (["viewer", "member", "admin", "owner"] as Role[]).forEach((r) =>
      expect(roleSatisfies(undefined, r)).toBe(false)
    );
  });
});
