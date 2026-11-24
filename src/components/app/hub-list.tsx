import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { cn } from "@/lib/utils";

export type HubItem = {
  name: string;
  hint: string;
  href: string;
  icon: LucideIcon;
};

// Simple tab screen: forest title bar + grouped link rows. The rows point at
// the existing desktop flows until each gets a mobile-native screen.
export function HubScreen({
  title,
  groups,
  footer,
}: {
  title: string;
  groups: { label?: string; items: HubItem[] }[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="pb-8 lg:pb-14">
      <header className="app-band text-white">
        <div
          className={cn(
            APP_CONTAINER,
            "px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-10",
          )}
        >
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">
            {title}
          </h1>
        </div>
      </header>
      <div
        className={cn(
          APP_CONTAINER,
          "lg:mt-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8",
        )}
      >
        {groups.map((g, i) => (
          <section key={g.label ?? i} className="mt-5 lg:mt-6">
            <h2
              className={cn(
                "eyebrow mx-5 mb-2 text-[10px] text-forest/65 lg:mx-1",
                !g.label && "hidden lg:block lg:invisible",
              )}
            >
              {g.label ?? "—"}
            </h2>
            <div className="mx-4 lg:mx-0 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
              {g.items.map((it) => (
                <Link
                  key={it.name}
                  href={it.href}
                  className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-forest/[0.02] active:bg-forest/[0.04]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turquoise-50 text-turquoise-700">
                    <it.icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-forest">
                      {it.name}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-forest/65">
                      {it.hint}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-forest/30" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className={APP_CONTAINER}>{footer}</div>
    </div>
  );
}
