"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleHelp, LayoutGrid, Lock, Menu, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { SectionLink } from "./section-link";

const PRODUCT_NAV = [
  { label: "Accounts", href: "/personal#accounts" },
  { label: "Cards", href: "/personal#cards" },
  { label: "Send & transfer", href: "/personal#transfers" },
  { label: "Insights", href: "/personal#insights" },
  { label: "Security", href: "/security" },
  { label: "How it works", href: "/how-it-works" },
];

export function SiteHeader({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgba(18,46,46,0.08)]">
      {/* Utility bar — audience segments */}
      <div className="bg-forest-900 text-[12px] text-white/70">
        <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between px-4 lg:px-8">
          <nav aria-label="Audience" className="flex h-full items-stretch">
            <Link
              href="/personal"
              aria-current="page"
              className="flex items-center bg-white/10 px-3 font-semibold text-white"
            >
              Personal
            </Link>
            <span className="flex items-center gap-1.5 px-3 text-white/45">
              Business
              <span className="rounded bg-white/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Soon
              </span>
            </span>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/security" className="hidden items-center gap-1.5 hover:text-white sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security centre
            </Link>
            <SectionLink href="/personal#help" className="flex items-center gap-1.5 hover:text-white">
              <CircleHelp className="h-3.5 w-3.5" />
              Help
            </SectionLink>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-4 lg:px-8">
        <Link href="/personal" aria-label="Moneta personal banking home">
          <Logo variant="full" tone="forest" size={30} priority />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-forest-700"
            >
              <LayoutGrid className="h-4 w-4" />
              Your accounts
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden text-right text-[13px] font-medium leading-tight text-forest/75 hover:text-forest sm:block"
              >
                New to Moneta?
                <br />
                <span className="font-semibold text-turquoise-700">Open an account</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-forest-700"
              >
                <Lock className="h-4 w-4" />
                Sign in
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-forest hover:bg-forest/5 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Product nav — desktop */}
      <nav
        aria-label="Products"
        className="hidden border-t border-forest/[0.07] lg:block"
      >
        <ul className="mx-auto flex h-12 max-w-[1200px] items-stretch gap-1 px-6">
          {PRODUCT_NAV.map((item) => (
            <li key={item.label} className="flex">
              <SectionLink
                href={item.href}
                className="ulink flex items-center px-3 text-[14px] font-medium text-forest/80 transition-colors hover:text-forest"
              >
                {item.label}
              </SectionLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Product nav — mobile drawer */}
      <nav
        id="site-mobile-nav"
        aria-label="Products"
        className={cn(
          "border-t border-forest/[0.07] bg-white lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <ul className="px-4 py-2">
          {PRODUCT_NAV.map((item) => (
            <li key={item.label}>
              <SectionLink
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-forest/[0.06] py-3.5 text-[15px] font-medium text-forest last:border-b-0"
              >
                {item.label}
              </SectionLink>
            </li>
          ))}
          <li>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block py-3.5 text-[15px] font-semibold text-turquoise-700"
            >
              Open an account
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
