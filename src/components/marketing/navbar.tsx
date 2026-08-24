"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const NAV_LINKS = [
  { href: "/#features", label: "Product" },
  { href: "/#card", label: "Card" },
  { href: "/#trust", label: "Security" },
];

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#122e2e]/[0.07] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Moneta home">
          <Logo variant="full" tone="forest" size={26} priority />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-[#5b6b6b] transition-colors hover:text-[#122e2e] sm:block"
            >
              {l.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="ml-1 inline-flex items-center rounded-full bg-gradient-to-b from-[#59cf8e] to-[#3fb073] px-4 py-2 text-sm font-semibold text-[#08221c] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_6px_16px_-8px_rgba(74,194,128,0.55)] transition hover:brightness-105"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#122e2e] transition hover:bg-[#122e2e]/[0.04]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="ml-1 inline-flex items-center rounded-full bg-gradient-to-b from-[#59cf8e] to-[#3fb073] px-4 py-2 text-sm font-semibold text-[#08221c] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_6px_16px_-8px_rgba(74,194,128,0.55)] transition hover:brightness-105"
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
