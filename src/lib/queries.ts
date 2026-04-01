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

  wallets: {
    all: ["wallets"] as const,
    balances: ["wallets", "balances"] as const,
    detail: (id: string) => ["wallets", "detail", id] as const,
  },

  transactions: {
    all: ["transactions"] as const,
    list: (params?: { status?: string; type?: string }) =>
      ["transactions", "list", params ?? {}] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },

  accounts: {
    all: ["accounts"] as const,
    byType: (type: string) => ["accounts", "type", type] as const,
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
