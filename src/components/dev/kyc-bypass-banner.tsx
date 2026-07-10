import { AlertTriangle } from "lucide-react";
import { isKycBypassed } from "@/lib/auth/kyc-bypass";

/**
 * Dev-only banner shown when BYPASS_KYC=true (and NODE_ENV !== "production").
 * Renders nothing in prod or when the flag is off — zero JS shipped to the
 * client either way, since this is a server component.
 */
export function KycBypassBanner() {
  if (!isKycBypassed()) return null;

  return (
    <div
      role="status"
      aria-label="Development KYC bypass is active"
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-[12px] font-medium text-amber-950"
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      <span className="font-semibold tracking-wide uppercase">DEV</span>
      <span aria-hidden="true">·</span>
      <span>
        KYC bypassed —{" "}
        <code className="rounded bg-amber-950/15 px-1 py-0.5 font-mono text-[11px]">
          BYPASS_KYC=true
        </code>{" "}
        is set. This flag never activates in production.
      </span>
    </div>
  );
}
