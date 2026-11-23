"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bell,
  CreditCard,
  LayoutGrid,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useDisplayName } from "@/components/app/data";
import { cn } from "@/lib/utils";

const TABS: { name: string; href: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  {
    name: "Accounts",
    href: "/app",
    icon: LayoutGrid,
    match: (p) => p === "/app" || p.startsWith("/app/accounts"),
  },
  {
    name: "Move money",
    href: "/app/move",
    icon: ArrowLeftRight,
    match: (p) => p.startsWith("/app/move"),
  },
  {
    name: "Card",
    href: "/app/card",
    icon: CreditCard,
    match: (p) => p.startsWith("/app/card"),
  },
  {
    name: "More",
    href: "/app/more",
    icon: Menu,
    match: (p) => p.startsWith("/app/more"),
  },
];

// Responsive app shell.
//   < lg: full-screen phone layout, bottom tab bar.
//   ≥ lg: forest top bar with the same four sections; pages switch to
//         wide multi-column layouts inside a max-w container (APP_CONTAINER).
// Content scrolls inside <main>; the bars stay pinned.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f3f5f4]">
      <DesktopNav pathname={pathname} />

      <main className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="shrink-0 border-t border-forest/[0.08] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <li key={t.name}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center gap-1 pb-2.5 pt-3 text-[11px] font-medium transition-colors",
                    active
                      ? "text-forest"
                      : "text-forest/45 hover:text-forest/75"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-6 top-0 h-[3px] rounded-b-full transition-colors",
                      active ? "bg-turquoise" : "bg-transparent"
                    )}
                  />
                  <t.icon
                    className="h-[21px] w-[21px]"
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Shared page-width container so the nav and every page line up. Below lg
 *  the phone layout is capped so tablets don't get stretched rows. */
export const APP_CONTAINER =
  "mx-auto w-full max-w-[640px] lg:max-w-[1180px] lg:px-8";

function DesktopNav({ pathname }: { pathname: string }) {
  const { initials } = useDisplayName();
  return (
    <header className="hidden shrink-0 bg-forest text-white lg:block">
      <div className={cn(APP_CONTAINER, "flex h-16 items-center gap-10")}>
        <Link href="/app" aria-label="Moneta home">
          <Logo variant="full" tone="reverse" size={26} priority />
        </Link>

        <nav aria-label="Primary" className="flex h-full items-stretch gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.name}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center px-3.5 text-[14px] font-medium transition-colors",
                  active ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {t.name}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3.5 bottom-0 h-[3px] rounded-t-full transition-colors",
                    active ? "bg-turquoise" : "bg-transparent"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className="mr-2 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/55 ring-1 ring-white/15 transition hover:text-white hover:ring-white/30"
          >
            Classic dashboard
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-[19px] w-[19px]" />
          </button>
          <Link
            href="/app/more"
            aria-label="Profile and settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-turquoise text-[12px] font-semibold text-forest-900"
          >
            {initials}
          </Link>
        </div>
      </div>
      <div className="h-px bg-white/[0.07]" />
    </header>
  );
}
