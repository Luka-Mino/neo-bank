"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Send,
  History,
  Users,
  Settings,
  Landmark,
  CreditCard,
  BarChart3,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { DEMO_MODE, DEMO_SESSION } from "@/lib/demo-data";
import { AccountSwitcher } from "@/components/account/account-switcher";
import { withAccountParam } from "@/components/account/with-account-param";
import { useSearchParams } from "next/navigation";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Accounts", href: "/accounts", icon: Wallet },
    ],
  },
  {
    label: "Money",
    items: [
      { name: "Deposit", href: "/deposit", icon: ArrowDownToLine },
      { name: "Transfer Out", href: "/transfer-out", icon: ArrowUpFromLine },
      { name: "Move funds", href: "/transfer-internal", icon: ArrowLeftRight },
      { name: "Send", href: "/send", icon: Send },
    ],
  },
  {
    label: "Products",
    items: [
      { name: "Card", href: "/card", icon: CreditCard },
      { name: "Loans", href: "/loans", icon: Landmark },
    ],
  },
  {
    label: "Activity",
    items: [
      { name: "Transactions", href: "/transactions", icon: History },
      { name: "Recipients", href: "/recipients", icon: Users },
      { name: "Insights", href: "/insights", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export { navigationGroups };

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: realSession } = useSession();
  const session = DEMO_MODE ? DEMO_SESSION : realSession;
  const name = session?.user?.name || "—";
  const email = session?.user?.email || "—";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col bg-forest-900 text-white lg:flex"
      style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo variant="full" tone="reverse" size={28} />
        </Link>
      </div>

      {/* Account switcher (top of sidebar, above the nav groups) */}
      <AccountSwitcher />

      <div className="my-4 mx-3 h-px bg-white/[0.06]" />

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="eyebrow mb-1 px-3 text-[10px] text-white/40">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              const href = withAccountParam(item.href, searchParams);
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    "group/nav flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                    isActive
                      ? "nav-active"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-[17px] w-[17px]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User chip */}
      <div className="m-3 flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.04] p-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-turquoise text-[12px] font-semibold text-forest-900">
          {initials || "AM"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">{name}</div>
          <div className="truncate text-[11px] text-white/50">{email}</div>
        </div>
        <Link
          href="/settings"
          className="text-white/50 hover:text-white"
          aria-label="Account settings"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
