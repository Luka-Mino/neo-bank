/**
 * Manual/local events reconciliation run.
 *
 *   npm run dakota:reconcile
 *
 * Retries unprocessed inbox rows, then sweeps GET /events from the stored
 * cursor. This is how local dev picks up sandbox events without a public
 * webhook tunnel — run it after any sandbox action (or on a watch loop).
 * Requires DAKOTA_API_KEY and DATABASE_URL in .env.local.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

async function main() {
  // Dynamic import: the db module opens its connection at import time, so
  // dotenv must populate the environment first (static imports hoist).
  const { reconcileEvents } = await import("../src/lib/dakota/reconcile");

  const result = await reconcileEvents();

  const { retry, sweep } = result;
  console.log(
    `retry phase:  ${retry.attempted} attempted — ${retry.processed} processed, ` +
      `${retry.ignored} ignored, ${retry.failed} failed`
  );
  console.log(
    `sweep phase:  ${sweep.scanned} scanned over ${sweep.pages} page(s) — ` +
      `${sweep.processed} processed, ${sweep.ignored} ignored, ` +
      `${sweep.alreadyProcessed} already seen, ${sweep.failed} failed`
  );
  console.log(`cursor:       ${sweep.cursor ?? "(none)"}`);
  if (sweep.orderingSuspect) {
    console.warn(
      "⚠ /events returned newest-first — flip the pagination strategy " +
        "in src/lib/dakota/reconcile.ts (see orderingSuspect)."
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
