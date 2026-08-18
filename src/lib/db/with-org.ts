import { sql } from "drizzle-orm";
import { db } from "./index";

// The RLS glue. Runs `fn` inside a transaction that sets the request's org on a
// transaction-scoped GUC (`is_local=true` — required under the Supabase
// transaction-pooler, which reuses connections). Row-Level Security policies on
// the class-A tables read `app.current_org_id`; when it's unset the policy
// predicate becomes `org_id = NULL` → false → ZERO rows (fail-closed). So even a
// query that forgets its WHERE clause cannot leak another tenant's data.
// See ORG-FOUNDATION-SPEC.md.

export type DbClient = typeof db;
export type DbTx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export async function withOrg<T>(
  orgId: string,
  fn: (tx: DbTx) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.current_org_id', ${orgId}, true)`);
    return fn(tx);
  });
}
