import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/login", label: "Log in" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#e3e6e5] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center" aria-label="Moneta home">
            <Logo variant="full" tone="forest" size={22} />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#5b6b6b]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-[#122e2e]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-[#e3e6e5] py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-[#122e2e]/50">
            Built on Dakota&apos;s regulated infrastructure · funds held at partner banks
          </p>
          <p className="text-xs text-[#122e2e]/45">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Moneta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
