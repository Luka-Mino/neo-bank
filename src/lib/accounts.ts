// Shared helpers for the user-facing accounts feature.
// Generation, validation, and constants — no DB access here.

/**
 * Allowed account types at this point. The DB column is free-text so adding
 * new entries here is the only change needed when joint / business / goal
 * accounts come online.
 */
export const ACCOUNT_TYPES = ["checking", "savings"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_STATUSES = ["active", "frozen", "closed"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/**
 * 14-digit Moneta account number with a fixed 2-digit IIN-style prefix.
 * Pure-random (not Luhn) for now; the issuer would replace this.
 */
import { randomInt } from "node:crypto";

export function generateAccountNumber(): string {
  // Cryptographically random so numbers aren't guessable/sequential. This is
  // Moneta's internal display number; the real ACH/wire routing+account
  // numbers come from Dakota (dakota_rails.bank_account_info, shown once
  // provisioning completes).
  const rand12 = Array.from({ length: 12 }, () => randomInt(10)).join("");
  return `40${rand12}`;
}

/** Default labels per type — used when nickname is omitted. */
export function defaultNickname(type: AccountType): string {
  switch (type) {
    case "checking":
      return "Checking";
    case "savings":
      return "Savings";
  }
}
