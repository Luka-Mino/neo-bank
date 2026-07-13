import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-moneta-hero relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#4ac280]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#22d3ee]/15 blur-3xl" />

        <Link href="/" className="relative inline-flex items-center">
          <Logo variant="full" tone="reverse" size={28} />
        </Link>

        <div className="relative max-w-md space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9be3b8]">
            Stablecoin banking, regulated rails
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Real dollars, moving in real time.
          </h2>
          <p className="text-sm text-white/70">
            Hold, send, and spend dollar-backed digital cash that settles
            on-chain in seconds — protected by FDIC pass-through partner banks.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-white/55">
          <ShieldCheck className="h-4 w-4 text-[#4ac280]" />
          FDIC pass-through up to $250K · Bank-grade security
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="lg:hidden">
            <Logo variant="full" tone="turquoise" size={24} />
          </Link>
          <div className="ml-auto text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← Back to site
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
