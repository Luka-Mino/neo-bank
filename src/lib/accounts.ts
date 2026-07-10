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
export function generateAccountNumber(): string {
  const rand12 = Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0");
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
