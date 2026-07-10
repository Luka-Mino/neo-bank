"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-deep-forest/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo variant="full" tone="reverse" size={26} priority />
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="#features"
            className="hidden text-sm text-white/60 transition-colors hover:text-white sm:block"
          >
            Features
          </Link>
          <Link
            href="#card"
            className="hidden text-sm text-white/60 transition-colors hover:text-white sm:block"
          >
            Card
          </Link>
          <Link
            href="#trust"
            className="hidden text-sm text-white/60 transition-colors hover:text-white sm:block"
          >
            Security
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants(),
                "bg-[#4ac280] text-[#0a1c1c] hover:bg-[#5ed092]"
              )}
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  "bg-[#4ac280] text-[#0a1c1c] hover:bg-[#5ed092]"
                )}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
