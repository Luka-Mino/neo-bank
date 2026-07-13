import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a1c1c] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo variant="full" tone="reverse" size={22} />
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/55">
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href="/login" className="transition-colors hover:text-white">
            Log in
          </Link>
        </div>

        <p className="text-sm text-white/45">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Moneta. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
