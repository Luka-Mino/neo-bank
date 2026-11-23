// Pure helpers behind <AmountInput>. Kept framework-free so they're unit
// tested: amount entry is where typos turn into wrong payments.

/** Max dollars accepted by the field (server validators are authoritative). */
export const MAX_AMOUNT = 1_000_000;

/**
 * Normalise what the user typed into a plain decimal string:
 * digits and one ".", at most 2 decimals, no leading zeros ("007" → "7"),
 * commas/spaces/"$" dropped (pasting "$1,250.50" works).
 */
export function sanitizeAmount(raw: string): string {
  let s = raw.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
    const [whole, frac] = s.split(".");
    s = `${whole}.${frac.slice(0, 2)}`;
  }
  // Strip leading zeros, but keep "0" before a decimal point ("0.5").
  s = s.replace(/^0+(?=\d)/, "");
  if (s.startsWith(".")) s = `0${s}`;
  return s;
}

/** Number value of a sanitised amount; 0 for empty or invalid input. */
export function parseAmount(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Fixed two-decimal string for APIs ("12.5" → "12.50"). */
export function toApiAmount(s: string): string {
  return parseAmount(s).toFixed(2);
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type AmountCheck =
  | { ok: true }
  | { ok: false; message: string };

/** Client-side check; the server re-validates (and adds fees). */
export function checkAmount(
  s: string,
  { available, min = 0.01 }: { available?: number; min?: number } = {}
): AmountCheck {
  const n = parseAmount(s);
  if (n <= 0) return { ok: false, message: "Enter an amount" };
  if (n < min) return { ok: false, message: `The minimum is ${formatUsd(min)}` };
  if (n > MAX_AMOUNT) return { ok: false, message: `The maximum is ${formatUsd(MAX_AMOUNT)}` };
  if (available !== undefined && n > available) {
    return { ok: false, message: `That's more than the ${formatUsd(available)} available` };
  }
  return { ok: true };
}
