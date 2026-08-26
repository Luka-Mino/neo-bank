"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/security", label: "Security" },
  { href: "/#card", label: "Card" },
];

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.07] bg-[#0a1c1c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Moneta home">
          <Logo variant="full" tone="reverse" size={26} priority />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="ulink hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
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
                className="rounded-full px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.06]"
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
