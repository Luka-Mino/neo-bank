// Query key factory + fetch helper — adapted from Lawzy

// ─── Fetcher utility ────────────────────────────────────────────────────────

export async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await res.json();
  if (!res.ok || (json.success !== undefined && !json.success)) {
    throw new Error(
      json.error?.message || json.error || `Request failed: ${res.status}`
    );
  }
  return json;
}

// ─── Query key factory ──────────────────────────────────────────────────────

export const queryKeys = {
  customer: {
    all: ["customer"] as const,
    me: ["customer", "me"] as const,
  },

  // User-facing banking accounts (checking, savings, ...)
  accounts: {
    all: ["accounts"] as const,
    list: ["accounts", "list"] as const,
    balances: ["accounts", "balances"] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
    transactions: (id: string) => ["accounts", "transactions", id] as const,
  },

  // Issued cards belonging to the user
  cards: {
    all: ["cards"] as const,
    list: ["cards", "list"] as const,
    detail: (id: string) => ["cards", "detail", id] as const,
  },

  // Dakota on-ramp / off-ramp rail config (NOT user-facing accounts)
  rails: {
    all: ["rails"] as const,
    byType: (type: string) => ["rails", "type", type] as const,
  },

  // Custodial Dakota wallet (one per user). Kept for the existing dashboard
  // query during the migration window; the dashboard reads accounts/balances
  // for new code.
  wallets: {
    all: ["wallets"] as const,
    balances: ["wallets", "balances"] as const,
    detail: (id: string) => ["wallets", "detail", id] as const,
  },

  transactions: {
    all: ["transactions"] as const,
    list: (params?: { accountId?: string; status?: string; type?: string }) =>
      ["transactions", "list", params ?? {}] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },

  recipients: {
    all: ["recipients"] as const,
    detail: (id: string) => ["recipients", "detail", id] as const,
    destinations: (id: string) =>
      ["recipients", "destinations", id] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
};
