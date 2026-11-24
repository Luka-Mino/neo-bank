// Support requests and complaints (LAUNCH-READINESS-PLAN 1c.3).
//
// Why this is ours and not Dakota's: Dakota's model puts support with the
// platform ("your team owns the customer relationship ... support"), and card
// disputes reach us first. Dakota files card disputes with Visa once we report
// them with POST /card_dispute_reports. That call is wired when Cards leaves
// Dakota's sandbox (plan 5.3). Until then a card dispute is forwarded by hand.
//
// Category and status values are CHECK-constrained in migration 0020.

import { randomInt } from "node:crypto";
import { z } from "zod";

export const SUPPORT_CATEGORIES = ["question", "complaint", "card_dispute", "fraud"] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_STATUSES = ["open", "in_progress", "forwarded", "resolved"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const supportRequestSchema = z
  .object({
    category: z.enum(SUPPORT_CATEGORIES),
    subject: z.string().trim().min(3, "Add a short subject").max(120, "Keep the subject under 120 characters"),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more so we can help")
      .max(5000, "Keep the message under 5,000 characters"),
    transactionId: z.string().uuid().optional(),
  })
  .strict();

export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

// Unambiguous characters only (no 0/O, 1/I/L), so a reference read out over
// the phone or typed from an email comes through intact.
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** A short human-facing reference such as "SUP-7K2Q9X". */
export function makeSupportReference(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `SUP-${s}`;
}

/** Escape user text before it goes into an HTML email. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
