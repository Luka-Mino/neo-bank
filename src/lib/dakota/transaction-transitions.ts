/**
 * Status-transition rules for Dakota-sourced transactions.
 *
 * Dakota delivers webhooks at-least-once and possibly out of lifecycle order,
 * so every status write must be guarded: treat the incoming status as truth
 * only if the move is legal from where we are. ACH is the reason "completed"
 * is not fully terminal — funds can be clawed back days later
 * (completed → pending_return/returned, completed → pending_reversal/reversed).
 */

/** States that can never be left. */
const HARD_TERMINAL = new Set([
  "failed",
  "canceled",
  "cancelled", // Dakota uses both spellings across resources
  "rejected",
  "invalid",
  "timed_out",
  "returned",
  "reversed",
]);

/** The only states reachable from `completed` (ACH return/reversal path). */
const POST_COMPLETION = new Set([
  "pending_return",
  "returned",
  "pending_reversal",
  "reversed",
]);

/** Clawback states: funds previously credited must be debited back. */
export const CLAWBACK_STATUSES = new Set(["returned", "reversed"]);

export function isTransitionAllowed(
  oldStatus: string | null | undefined,
  newStatus: string
): boolean {
  if (!oldStatus) return true; // new row, any starting status
  if (oldStatus === newStatus) return false;
  if (HARD_TERMINAL.has(oldStatus)) return false;
  if (oldStatus === "completed") return POST_COMPLETION.has(newStatus);
  return true;
}

/** Map a Dakota auto-transaction type to our ledger tx_type. */
export function ledgerTxType(dakotaType: string): string {
  switch (dakotaType) {
    case "onramp":
      return "deposit";
    case "offramp":
      return "withdrawal";
    case "swap":
      return "swap";
    default:
      return dakotaType;
  }
}

/** Strict decimal-string check before an amount goes anywhere near SQL. */
export function isValidAmount(value: unknown): value is string {
  return typeof value === "string" && /^\d+(\.\d+)?$/.test(value) && Number(value) > 0;
}
