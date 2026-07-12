"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  Menu,
  LogOut,
  User,
  ShieldCheck,
  Search,
} from "lucide-react";
import { NotificationDropdown } from "./notification-dropdown";
import { navigationGroups } from "./sidebar";
import { Logo } from "@/components/shared/logo";
import { DEMO_MODE, DEMO_SESSION } from "@/lib/demo-data";

export function Header() {
  const { data: realSession } = useSession();
  const session = DEMO_MODE ? DEMO_SESSION : realSession;
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-none bg-deep-forest p-0 text-[#f6f6f6]">
          <div className="flex h-16 items-center border-b border-white/8 px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo variant="full" tone="reverse" size={26} />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#4ac280] text-[#0a1c1c]"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
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
          <div className="border-t border-white/8 p-4">
            <div className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4ac280]" />
              <div>
                <p className="text-xs font-medium text-white">Bank-grade security</p>
                <p className="text-[10px] leading-tight text-white/60">
                  Funds protected up to $250K
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
        <Logo variant="full" tone="turquoise" size={22} />
      </Link>

      {/* Search — submits to the transactions feed's q filter */}
      <form
        className="relative hidden max-w-[460px] flex-1 lg:block"
        onSubmit={(e) => {
          e.preventDefault();
          if (searchValue.trim()) {
            router.push(
              `/transactions?q=${encodeURIComponent(searchValue.trim())}`
            );
          }
        }}
      >
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search transactions…"
          aria-label="Search transactions"
          className="h-10 w-full rounded-full border border-foreground/[0.08] bg-white pl-10 pr-4 text-[14px] placeholder:text-foreground/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-turquoise"
        />
      </form>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="flex items-center gap-2 rounded-full pl-1 pr-3" />}
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline-block">
              {session?.user?.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Link href="/settings" className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
