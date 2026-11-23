"use client";

import { shortDate, signedMoney, txMeta, type AppTx } from "./data";
import { cn } from "@/lib/utils";

export function ActivityRow({
  tx,
  accountName,
  showDate = true,
}: {
  tx: AppTx;
  accountName?: string | null;
  /** Off inside date-grouped lists, where the heading already gives the day. */
  showDate?: boolean;
}) {
  const meta = txMeta(tx.txType);
  const amt = Number(tx.sourceAmount || 0);
  const pending = tx.status === "pending";
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-3.5 last:border-b-0">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          meta.direction === "in"
            ? "bg-turquoise-50 text-turquoise-700"
            : "bg-forest/[0.06] text-forest/70"
        )}
      >
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-forest">
          {meta.label}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-forest/50">
          {[showDate ? shortDate(tx.createdAt) : null, accountName]
            .filter(Boolean)
            .join(" · ")}
          {pending ? (
            <>
              {showDate || accountName ? " · " : ""}
              <span className="font-medium text-cat-orange">Pending</span>
            </>
          ) : (
            !showDate && !accountName && "Completed"
          )}
        </div>
      </div>
      <div
        className={cn(
          "font-mono text-[14px] font-semibold tabular",
          meta.direction === "in" ? "text-turquoise-700" : "text-forest",
          pending && "opacity-60"
        )}
      >
        {signedMoney(amt, meta.direction)}
      </div>
    </div>
  );
}
