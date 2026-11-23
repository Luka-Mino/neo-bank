"use client";

import Link from "next/link";
import { shortDate, signedMoney, txMeta, txStatus, type AppTx } from "./data";
import { Icon } from "@/components/brand/icon";
import { cn } from "@/lib/utils";

// One activity line. Links to the transaction's detail page.
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
  const status = txStatus(tx.status);
  const amt = Number(tx.sourceAmount || 0);
  const detail = [showDate ? shortDate(tx.createdAt) : null, accountName].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/app/activity/${encodeURIComponent(tx.id)}`}
      className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-forest/[0.02] active:bg-forest/[0.04] outline-none focus-visible:bg-turquoise-50/60"
    >
      <span
        aria-hidden
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          meta.direction === "in" ? "bg-turquoise-50 text-forest" : "bg-forest/[0.06] text-forest/80"
        )}
      >
        <Icon name={meta.glyph} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-forest">{meta.label}</div>
        <div className="mt-0.5 truncate text-[12px] text-forest/50">
          {detail}
          {status.tone !== "done" ? (
            <>
              {detail ? " · " : ""}
              <span className={cn("font-medium", status.tone === "problem" ? "text-[#b42f34]" : "text-cat-orange")}>{status.label}</span>
            </>
          ) : (
            !detail && "Completed"
          )}
        </div>
      </div>
      <div
        className={cn(
          "font-mono text-[14px] font-semibold tabular",
          meta.direction === "in" ? "text-turquoise-700" : "text-forest",
          status.tone === "pending" && "opacity-60",
          status.tone === "problem" && "text-forest/40 line-through decoration-forest/30"
        )}
      >
        {signedMoney(amt, meta.direction)}
      </div>
    </Link>
  );
}
