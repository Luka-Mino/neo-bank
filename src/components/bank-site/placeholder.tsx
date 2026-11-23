import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Deliberately loud placeholders for the /personal site draft. Anything that
// needs a real fact (offer terms, phone numbers, legal disclosures) or a real
// photo renders in amber so it can't ship unnoticed.
// Find them all with:  grep -rn "<Ph\b\|<PhotoPlaceholder" src/

export function Ph({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-[4px] border border-dashed border-amber-500/70 bg-amber-100 px-1 text-amber-900",
        className
      )}
      title="Placeholder — replace before launch"
    >
      [PLACEHOLDER: {children}]
    </span>
  );
}

export function PhotoPlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${label}`}
      className={cn(
        "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-amber-500/60 bg-amber-50 p-4 text-center text-amber-900",
        className
      )}
    >
      <ImageIcon className="h-6 w-6 opacity-70" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
        Photo placeholder
      </span>
      <span className="max-w-[26ch] text-[12px] leading-snug opacity-80">
        {label}
      </span>
    </div>
  );
}
