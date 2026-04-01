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
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  History,
  Users,
  Settings,
  Shield,
  Menu,
  LogOut,
  User,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deposit", href: "/deposit", icon: ArrowDownToLine },
  { name: "Withdraw", href: "/withdraw", icon: ArrowUpFromLine },
  { name: "Send", href: "/send", icon: Send },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "Recipients", href: "/recipients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

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
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
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
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

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
    </header>
  );
}
