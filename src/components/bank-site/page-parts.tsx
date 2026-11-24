import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/brand/button";
import { IconDisc, type IconName } from "@/components/brand/icon";
import { CoinSeal } from "@/components/brand/moneta-card-art";
import { auth } from "@/lib/auth/config";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { cn } from "@/lib/utils";

// Shared chrome + building blocks for the retail-bank style public site
// (/personal, /security, /how-it-works, legal pages).

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="site-shell flex min-h-screen flex-col bg-white text-forest">
      <SiteHeader isAuthenticated={!!session} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Interior-page banner: breadcrumb, title, lead, optional side panel. */
export function PageHero({
  crumb,
  eyebrow,
  title,
  lead,
  aside,
}: {
  crumb: string;
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="bg-stone-field relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          // Seamless tile (generated from a periodic height field), so
          // repeats line up with no visible seams.
          backgroundImage: "url(/images/patterns/topo-forest.svg)",
          backgroundSize: "900px",
          backgroundPosition: "center top",
        }}
      />
      <div
        className={cn(
          "relative mx-auto max-w-[1200px] px-4 py-10 lg:px-8 lg:py-14",
          aside && "grid items-center gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12"
        )}
      >
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-forest/65">
            <Link href="/" className="hover:text-forest hover:underline">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span aria-current="page" className="font-medium text-forest">
              {crumb}
            </span>
          </nav>
          {eyebrow && <p className="eyebrow mt-6 text-copper">{eyebrow}</p>}
          <h1
            className={cn(
              "font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.015em] lg:text-[44px]",
              eyebrow ? "mt-3" : "mt-6"
            )}
          >
            {title}
          </h1>
          {lead && (
            <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-forest/70 lg:text-[17px]">
              {lead}
            </p>
          )}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="max-w-[60ch]">
      {eyebrow && (
        <p className={cn("eyebrow", dark ? "text-copper-light" : "text-copper")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-[28px] font-semibold tracking-[-0.01em] lg:text-[36px]",
          eyebrow && "mt-3"
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-3 text-[16px] leading-relaxed",
            dark ? "text-white/70" : "text-forest/65"
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export function ClosingCta({
  title,
  body,
  cta = { label: "Open an account", href: "/register" },
}: {
  title: string;
  body: React.ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
      <div className="engraved bg-stone-field flex flex-col items-start gap-6 p-9 [--r:28px] lg:flex-row lg:items-center lg:justify-between lg:p-14">
        <div className="flex items-center gap-6">
          <CoinSeal size={92} className="hidden sm:block" />
          <div>
            <h2 className="font-display text-[28px] font-semibold tracking-[-0.01em] lg:text-[34px]">
              {title}
            </h2>
            <p className="mt-2 max-w-[60ch] text-[15px] text-forest/65">{body}</p>
          </div>
        </div>
        <ButtonLink href={cta.href} size="lg" arrow className="shrink-0">
          {cta.label}
        </ButtonLink>
      </div>
    </section>
  );
}

/** White card with a brand icon disc (style A) — the standard feature tile. */
export function IconCard({
  icon,
  title,
  children,
  className,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-forest/[0.08] bg-white p-6 shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-24px_rgba(18,46,46,0.3)]",
        className
      )}
    >
      <IconDisc name={icon} size={48} />
      <h3 className="mt-4 text-[17px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-forest/65">{children}</p>
    </div>
  );
}
