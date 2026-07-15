import { describe, expect, it } from "vitest";
import {
  looksLikeBackupCode,
  normalizeBackupCode,
} from "@/lib/auth/backup-codes";

describe("normalizeBackupCode", () => {
  it("strips hyphens/spaces and uppercases", () => {
    expect(normalizeBackupCode("abcde-fghij")).toBe("ABCDEFGHIJ");
    expect(normalizeBackupCode(" A B C D E F G H J K ")).toBe("ABCDEFGHJK");
  });
});

describe("looksLikeBackupCode", () => {
  it("accepts a well-formed 10-char code (formatted or not)", () => {
    expect(looksLikeBackupCode("ABCDE-FGHJK")).toBe(true);
    expect(looksLikeBackupCode("ABCDEFGHJK")).toBe(true);
  });

  it("rejects a 6-digit TOTP code so normal logins skip the codes table", () => {
    expect(looksLikeBackupCode("123456")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(looksLikeBackupCode("ABCDE")).toBe(false);
    expect(looksLikeBackupCode("ABCDE-FGHJK-LMNPQ")).toBe(false);
  });

  it("rejects ambiguous/out-of-alphabet characters (0,1,I,O,L,U)", () => {
    expect(looksLikeBackupCode("ABCDE-FGHI0")).toBe(false); // 0
    expect(looksLikeBackupCode("ABCDE-FGHI1")).toBe(false); // 1
    expect(looksLikeBackupCode("ABCDE-FGHIO")).toBe(false); // O
    expect(looksLikeBackupCode("ABCDE-FGHIU")).toBe(false); // U
  });
});
