import { ShieldCheck } from "lucide-react";

export function TrustBadge() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div>
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
          Your funds are protected
        </p>
        <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
          Deposits are held at FDIC-insured partner banks, eligible for
          pass-through insurance up to $250,000 per depositor.
        </p>
      </div>
    </div>
  );
}
