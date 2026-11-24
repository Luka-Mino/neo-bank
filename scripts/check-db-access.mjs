#!/usr/bin/env node
// CI guard for row-level security (migration 0021, PRE-DAKOTA-PLAN C1).
//
// Two rules, checked over src/ and scripts/:
//   1. `systemDb` (bypasses RLS) may be imported only by the files in
//      SYSTEM_ALLOWLIST, each with a reason. Tests may use it for fixtures.
//   2. A file that imports the global `db` must not use the protected
//      (class-A) tables. Request code reaches them through `ctx.db` (inside
//      withOrg) or `withOrg(orgId, tx => …)`. Under RLS a bare `db` query on
//      these tables returns nothing, so this catches the bug before it ships.
//
// Usage: node scripts/check-db-access.mjs   (exit 1 on violations)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const CLASS_A_TABLES = [
  "dakotaCustomers",
  "wallets",
  "dakotaRails",
  "accounts",
  "cards",
  "transactions",
  "recipients",
  "recurringTransfers",
  "destinations",
  "walletBalances",
  "transactionStatusHistory",
];

// path (relative to repo root, forward slashes) → why it may bypass RLS.
export const SYSTEM_ALLOWLIST = {
  "src/lib/db/index.ts": "defines systemDb",
  "src/app/api/health/route.ts": "reads only the system role's attributes to report RLS posture",
  "src/lib/dakota/webhook-handlers.ts": "Dakota webhooks: no signed-in org; org comes from the Dakota record",
  "src/lib/dakota/event-processing.ts": "webhook/reconcile event inbox",
  "src/lib/dakota/reconcile.ts": "cron reconcile across every org",
  "src/lib/dakota/provisioning.ts": "post-KYC provisioning, triggered by webhooks",
  "src/app/api/transfers/recurring/run/route.ts": "cron scan of due rules across orgs; each rule then runs in withOrg",
  "src/app/api/users/route.ts": "account deletion: user-level, across the user's orgs",
  "src/app/api/users/data/route.ts": "data export: user-level, across the user's orgs",
  "src/lib/transfers.ts": "findInternalLedgerDrift: system-wide ledger check",
  "src/lib/card-issuer.ts": "TEMPORARY: per-user card lookups predate orgs; move to withOrg in plan 5.3",
};

/** Specifiers imported from "@/lib/db" (static or `await import`), as [imported, local]. */
function dbImports(src) {
  const out = [];
  const re =
    /import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']@\/lib\/db["']|\{([^}]*)\}\s*=\s*await\s+import\(\s*["']@\/lib\/db["']\s*\)/g;
  for (const m of src.matchAll(re)) {
    if (m[1]) continue; // `import type { … }` carries no runtime connection
    const clause = m[2] ?? m[3];
    for (const part of clause.split(",")) {
      const [imported, local] = part.trim().split(/\s+as\s+|\s*:\s*/).map((x) => x?.trim());
      if (imported) out.push([imported, local || imported]);
    }
  }
  return out;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/**
 * Queries on the global `db` (by its local name) that touch protected tables.
 * Handles db.select(…).from(T), db.insert/update/delete(T) and db.query.T.
 */
function globalDbQueries(src, local) {
  const id = local.replace(/[$]/g, "\\$&");
  const hits = new Set();
  const lead = `(?<![.\\w$])${id}\\s*\\.\\s*`;
  for (const m of src.matchAll(new RegExp(`${lead}(?:insert|update|delete)\\s*\\(\\s*(\\w+)`, "g"))) hits.add(m[1]);
  for (const m of src.matchAll(new RegExp(`${lead}select(?:Distinct)?\\s*\\([^;]*?\\)\\s*\\.\\s*from\\s*\\(\\s*(\\w+)`, "gs"))) hits.add(m[1]);
  for (const m of src.matchAll(new RegExp(`${lead}query\\s*\\.\\s*(\\w+)`, "g"))) hits.add(m[1]);
  return CLASS_A_TABLES.filter((t) => hits.has(t));
}

export function checkSource(path, rawSource) {
  const problems = [];
  const src = stripComments(rawSource);
  const isTest = /\.test\.(m?[jt]sx?)$/.test(path);
  const imports = dbImports(src);

  if (imports.some(([imported]) => imported === "systemDb") && !isTest && !(path in SYSTEM_ALLOWLIST)) {
    problems.push(
      `${path}: imports systemDb (bypasses row-level security) but isn't in SYSTEM_ALLOWLIST. ` +
        `Use ctx.db or withOrg(orgId, …); if this really is system work, add it to the allowlist with a reason.`
    );
  }

  if (!isTest && path !== "src/lib/db/index.ts" && path !== "src/lib/db/with-org.ts") {
    for (const [imported, local] of imports) {
      if (imported !== "db") continue;
      const used = globalDbQueries(src, local);
      if (used.length) {
        problems.push(
          `${path}: queries protected table(s) ${used.join(", ")} on the global db. ` +
            `Under row-level security these see nothing. Use ctx.db (orgScoped routes) or withOrg(orgId, tx => …).`
        );
      }
    }
  }
  // 3. Routes that aren't orgScoped get the plain app connection as ctx.db (no
  //    org set). Under RLS it sees no protected rows, so such handlers must
  //    use withOrg(orgId, tx => …) for those tables, not ctx.db.
  if (!isTest && /\/route\.ts$/.test(path)) {
    for (const m of src.matchAll(/export const (GET|POST|PATCH|PUT|DELETE) = apiHandler(?:<[^>]*>)?\(\{/g)) {
      const start = m.index + m[0].length;
      const next = src.indexOf("\nexport const", start);
      const block = src.slice(start, next === -1 ? src.length : next);
      if (/orgScoped:\s*true/.test(block)) continue;
      if (!/handler:\s*async\s*\(\{[^}]*\bdb\b[^}]*\}\)/.test(block)) continue;
      const used = globalDbQueries(block, "db");
      if (used.length) {
        problems.push(
          `${path} ${m[1]}: not orgScoped, but queries protected table(s) ${used.join(", ")} on ctx.db, ` +
            `which has no org set. Wrap those queries in withOrg(orgId, tx => …) or make the route orgScoped.`
        );
      }
    }
  }
  return problems;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(m?[jt]sx?)$/.test(entry)) out.push(p);
  }
  return out;
}

function main() {
  const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
  const problems = [];
  for (const dir of ["src", "scripts"]) {
    for (const file of walk(join(root, dir))) {
      const rel = relative(root, file).split(sep).join("/");
      if (rel === "scripts/check-db-access.mjs") continue;
      problems.push(...checkSource(rel, readFileSync(file, "utf8")));
    }
  }
  for (const allowed of Object.keys(SYSTEM_ALLOWLIST)) {
    try {
      statSync(join(root, allowed));
    } catch {
      problems.push(`SYSTEM_ALLOWLIST lists ${allowed}, which no longer exists. Remove it.`);
    }
  }
  if (problems.length) {
    console.error(`check-db-access: ${problems.length} problem(s)\n\n${problems.join("\n\n")}`);
    process.exit(1);
  }
  console.log("check-db-access: ok");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
