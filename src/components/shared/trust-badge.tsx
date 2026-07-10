import { ShieldCheck } from "lucide-react";

export function TrustBadge() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium">
          Your funds are protected
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Deposits are held at FDIC-insured partner banks, eligible for
          pass-through insurance up to $250,000 per depositor.
        </p>
      </div>
    </div>
  );
}
