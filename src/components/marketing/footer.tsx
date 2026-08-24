import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-[#e3e6e5] bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Moneta home">
          <Logo variant="full" tone="forest" size={22} />
        </Link>

        <div className="flex items-center gap-6 text-sm text-[#5b6b6b]">
          <Link href="/terms" className="transition-colors hover:text-[#122e2e]">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[#122e2e]">
            Privacy
          </Link>
          <Link href="/login" className="transition-colors hover:text-[#122e2e]">
            Log in
          </Link>
        </div>

        <p className="text-sm text-[#122e2e]/45">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Moneta. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
