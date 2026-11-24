// The original signed-in app ("classic dashboard", src/app/(dashboard)) was
// replaced by /app and deleted on 2026-11-24 (PRE-DAKOTA-PLAN D1). These
// redirects keep old bookmarks, emails and notifications working. Query
// strings pass through (e.g. /send?to=… → /app/move/send?to=…).
// Used by next.config.ts; tested in legacy-routes.test.ts.

export const LEGACY_ROUTES: { source: string; destination: string }[] = [
  { source: "/dashboard", destination: "/app" },
  { source: "/accounts", destination: "/app" },
  { source: "/loans", destination: "/app" }, // loans were dropped (D7)
  { source: "/transactions", destination: "/app/activity" },
  { source: "/transactions/:id", destination: "/app/activity/:id" },
  { source: "/deposit", destination: "/app/move/deposit" },
  { source: "/send", destination: "/app/move/send" },
  { source: "/transfer-out", destination: "/app/move/withdraw" },
  { source: "/transfer-internal", destination: "/app/move/transfer" },
  { source: "/recipients", destination: "/app/move/recipients" },
  { source: "/recipients/new", destination: "/app/move/recipients/new" },
  { source: "/card", destination: "/app/card" },
  { source: "/insights", destination: "/app/insights" },
  { source: "/onboarding", destination: "/app/onboarding" },
  { source: "/settings", destination: "/app/more/settings" },
  { source: "/team", destination: "/app/more/team" },
  { source: "/approvals", destination: "/app/more/approvals" },
];

/** next.config.ts `redirects()` entries. Permanent: the old screens are gone for good. */
export function legacyRedirects() {
  return LEGACY_ROUTES.map((r) => ({ ...r, permanent: true }));
}

/** Where an old path now lives (for tests and one-off link fixes). */
export function resolveLegacyPath(pathname: string): string | null {
  for (const { source, destination } of LEGACY_ROUTES) {
    if (!source.includes(":")) {
      if (pathname === source) return destination;
      continue;
    }
    const re = new RegExp(`^${source.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`);
    const m = pathname.match(re);
    if (m?.groups) return destination.replace(/:(\w+)/g, (_, k: string) => m.groups![k]);
  }
  return null;
}
