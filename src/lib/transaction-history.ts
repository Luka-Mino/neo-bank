import type { db } from "@/lib/db";
import { withOrg } from "@/lib/db/with-org";
import { logger } from "@/lib/logger";
import { transactionStatusHistory } from "@/lib/db/schema";

// Either the root db or an open drizzle transaction. When the caller holds a
// row lock on the referenced transactions row (SELECT … FOR UPDATE inside
// db.transaction), it MUST pass its tx: the FK check on transaction_id needs
// a KEY SHARE on that row, and running it on a second pool connection
// deadlocks against the caller's own lock (and can't see uncommitted rows).
type DbExecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function logStatusChange(
  params: {
    transactionId: string;
    oldStatus: string | null;
    newStatus: string;
    reason?: string;
    actor?: string;
    orgId?: string | null;
  },
  // Without an executor, the row is written in its own org-scoped
  // transaction, so row-level security sees the right org.
  executor?: DbExecutor
) {
  try {
    if (!params.orgId) {
      // org_id is NOT NULL on this table (migration 0021); nothing to write.
      throw new Error(`status history for ${params.transactionId} has no orgId`);
    }
    const orgId = params.orgId;
    const insert = (ex: DbExecutor) =>
      ex.insert(transactionStatusHistory).values({
        transactionId: params.transactionId,
        oldStatus: params.oldStatus,
        newStatus: params.newStatus,
        reason: params.reason,
        actor: params.actor || "system",
        orgId,
      });
    if (executor) await insert(executor);
    else await withOrg(orgId, (tx) => insert(tx));
  } catch (error) {
    // Best-effort when standalone; inside a tx a failed statement poisons
    // the transaction and the caller's next statement will surface it.
    logger.error("Status history log error:", { detail: error instanceof Error ? error.message : String(error) })
  }
}
