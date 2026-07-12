// Transaction categorization: keyword mapper over merchant/note text with
// a tx-type fallback. Auto-assigned at write time; users can override via
// PATCH /api/transactions/[id] (manual choice always wins — we never
// re-categorize a row that already has a category).

export const CATEGORIES = {
  income: { label: "Income", color: "#4ac280" },
  food: { label: "Food & Dining", color: "#ff9500" },
  transport: { label: "Transport", color: "#2f80ed" },
  shopping: { label: "Shopping", color: "#8b5cf6" },
  entertainment: { label: "Entertainment", color: "#34c759" },
  bills: { label: "Bills & Utilities", color: "#22d3ee" },
  health: { label: "Health", color: "#ff3b30" },
  transfers: { label: "Transfers", color: "#64748b" },
  other: { label: "Other", color: "#9ca3af" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export function isCategory(v: string): v is CategoryKey {
  return v in CATEGORIES;
}

const KEYWORDS: Array<[CategoryKey, RegExp]> = [
  [
    "food",
    /\b(coffee|cafe|restaurant|grocer|groceries|food|dining|lunch|dinner|pizza|sushi|starbucks|doordash|ubereats|deli|bakery)\b/i,
  ],
  [
    "transport",
    /\b(uber|lyft|taxi|gas|fuel|parking|transit|metro|subway|train|flight|airline|shell|chevron|toll)\b/i,
  ],
  [
    "shopping",
    /\b(amazon|target|walmart|shopping|clothes|clothing|shoes|electronics|ikea|apparel)\b/i,
  ],
  [
    "entertainment",
    /\b(netflix|spotify|hulu|cinema|movie|concert|game|gaming|steam|tickets?)\b/i,
  ],
  [
    "bills",
    /\b(rent|mortgage|electric|electricity|water|internet|wifi|phone|utility|utilities|insurance|subscription|bill)\b/i,
  ],
  [
    "health",
    /\b(pharmacy|doctor|dental|dentist|gym|fitness|medical|health|cvs|walgreens|therapy)\b/i,
  ],
  ["income", /\b(salary|payroll|paycheck|invoice|refund)\b/i],
];

const TYPE_FALLBACK: Record<string, CategoryKey> = {
  onramp: "income",
  deposit: "income",
  offramp: "transfers",
  withdrawal: "transfers",
  wallet_send: "transfers",
  send: "transfers",
  internal_in: "transfers",
  internal_out: "transfers",
  swap: "other",
};

export function categorizeTransaction(input: {
  txType: string;
  note?: string | null;
  merchant?: string | null;
}): CategoryKey {
  const text = `${input.merchant ?? ""} ${input.note ?? ""}`.trim();
  if (text) {
    for (const [key, re] of KEYWORDS) {
      if (re.test(text)) return key;
    }
  }
  return TYPE_FALLBACK[input.txType] ?? "other";
}
