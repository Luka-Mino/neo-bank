"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  History,
  Users,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Money",
    items: [
      { name: "Deposit", href: "/deposit", icon: ArrowDownToLine },
      { name: "Withdraw", href: "/withdraw", icon: ArrowUpFromLine },
      { name: "Send", href: "/send", icon: Send },
    ],
  },
  {
    label: "Activity",
    items: [
      { name: "Transactions", href: "/transactions", icon: History },
      { name: "Recipients", href: "/recipients", icon: Users },
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

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">NeoBank</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
          <div>
            <p className="text-xs font-medium">Bank-grade security</p>
            <p className="text-[10px] text-muted-foreground">
              Funds protected up to $250K
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
