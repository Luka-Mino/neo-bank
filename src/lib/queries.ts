// Client-side data fetching: the JSON fetch helper and shared React Query keys.

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

// ─── Shared query keys ──────────────────────────────────────────────────────
// Keys for data that several screens read and invalidate (opening an account
// also adds its card, for example). A query used by one screen only keeps an
// inline key next to its useQuery.

export const queryKeys = {
  accounts: {
    all: ["accounts"] as const,
    list: ["accounts", "list"] as const,
  },
  cards: {
    all: ["cards"] as const,
    list: ["cards", "list"] as const,
  },
};
