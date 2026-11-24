import { cn } from "@/lib/utils";

// Deliberately loud placeholder for the public site. Anything that needs a
// real fact (offer terms, phone numbers, legal disclosures) renders in amber
// so it can't ship unnoticed. Find them all with:  grep -rn "<Ph\b" src/

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
