// Mock card-issuance helpers. When a real issuer integration lands, the
// `issueCard` function gets a real call; everything else stays put.

import type { CardType } from "@/lib/validators/card";

export function generateLast4(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function nextExpiry(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() + 4 };
}

export function defaultCardNickname(type: CardType): string {
  switch (type) {
    case "virtual":
      return "Virtual card";
    case "physical":
      return "Physical card";
    case "debit":
      return "Debit";
    case "credit":
      return "Credit";
  }
}

export function defaultNetwork(): "visa" | "mastercard" {
  return "visa";
}
