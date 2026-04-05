"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">NeoBank</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                Log In
              </Link>
              <Link href="/register" className={cn(buttonVariants())}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
