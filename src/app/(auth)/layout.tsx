import Link from "next/link";
import { ChevronLeft, CircleHelp, KeyRound, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";

// Retail-bank style sign-in frame: slim site header, the form card on a light
// band, and a "signing in safely" panel beside it on desktop.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-marble text-forest">
      <header className="bg-white shadow-[0_1px_0_rgba(18,46,46,0.08)]">
        <div className="bg-forest-900 text-[12px] text-white/70">
          <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between px-4 lg:px-8">
            <span className="flex h-full items-center bg-white/10 px-3 font-semibold text-white">
              Personal
            </span>
            <Link href="/security" className="flex items-center gap-1.5 hover:text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security centre
            </Link>
          </div>
        </div>
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-4 lg:px-8">
          <Link href="/personal" aria-label="Moneta personal banking home">
            <Logo variant="full" tone="forest" size={28} priority />
          </Link>
          <div className="flex items-center gap-5 text-[13px] font-medium">
            <Link href="/personal#help" className="hidden items-center gap-1.5 text-forest/70 hover:text-forest sm:flex">
              <CircleHelp className="h-4 w-4" />
              Help
            </Link>
            <Link href="/personal" className="flex items-center gap-1 text-forest/70 hover:text-forest">
              <ChevronLeft className="h-4 w-4" />
              Personal banking
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-turquoise-50"
        />
        <div className="relative mx-auto grid max-w-[1200px] items-start gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 lg:px-8 lg:py-14">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-forest/60">
              <Lock className="h-3.5 w-3.5 text-turquoise-700" />
              Secure sign-in
            </div>
            {children}
          </div>

          <aside className="mx-auto w-full max-w-md rounded-[18px] bg-forest p-6 text-white lg:mx-0 lg:mt-9">
            <h2 className="text-[16px] font-semibold">Signing in safely</h2>
            <ul className="mt-4 space-y-4 text-[13.5px] leading-relaxed text-white/75">
              <li className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-turquoise" />
                Moneta will never ask for your password or one-time codes by
                phone, text or email.
              </li>
              <li className="flex gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-turquoise" />
                Check for the padlock and Moneta&apos;s real web address in
                the address bar before you type anything.
              </li>
              <li className="flex gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-turquoise" />
                Turn on two-factor sign-in in Settings for an extra layer of
                protection.
              </li>
            </ul>
            <Link
              href="/security"
              className="mt-5 inline-flex text-[13px] font-semibold text-turquoise hover:underline"
            >
              Visit the Security centre →
            </Link>
          </aside>
        </div>
      </main>

      <footer className="border-t border-forest/[0.08] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-6 text-[12px] text-forest/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <nav className="flex gap-5">
            <Link href="/terms" className="hover:text-forest">Terms</Link>
            <Link href="/privacy" className="hover:text-forest">Privacy</Link>
            <Link href="/security" className="hover:text-forest">Security</Link>
          </nav>
          <p>
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            Moneta. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
