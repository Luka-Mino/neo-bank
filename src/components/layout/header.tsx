"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
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
  Shield,
  Menu,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { NotificationDropdown } from "./notification-dropdown";
import { navigationGroups } from "./sidebar";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
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
            <div className="flex items-center gap-2 px-3 py-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-xs font-medium">Bank-grade security</p>
                <p className="text-[10px] text-muted-foreground">Funds protected up to $250K</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
      {/* Notifications */}
      <NotificationDropdown />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="flex items-center gap-2" />}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
