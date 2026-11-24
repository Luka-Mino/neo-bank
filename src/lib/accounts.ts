// Shared helpers for the user-facing accounts feature.
// Generation, validation, and constants — no DB access here.

import { randomInt } from "node:crypto";

/**
 * Internal account types. Customers never see a type: accounts are just
 * named accounts (decided 2026-11-24 — no "Checking"/"Savings", which are
 * bank deposit-account names). The column stays for compatibility; new
 * accounts are stored as "checking" and the value is never displayed.
 */
export const ACCOUNT_TYPES = ["checking", "savings"] as const;

/**
 * 14-digit Moneta account number with a fixed 2-digit IIN-style prefix.
 * Pure-random (not Luhn) for now; the issuer would replace this.
 */
export function generateAccountNumber(): string {
  // Cryptographically random so numbers aren't guessable/sequential. This is
  // Moneta's internal display number; the real ACH/wire routing+account
  // numbers come from Dakota (dakota_rails.bank_account_info, shown once
  // provisioning completes).
  const rand12 = Array.from({ length: 12 }, () => randomInt(10)).join("");
  return `40${rand12}`;
}

/** Name used when none is given. Never the internal type. */
export function defaultNickname(): string {
  return "Account";
}
