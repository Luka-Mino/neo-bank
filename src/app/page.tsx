import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClosingCta, SiteShell } from "@/components/bank-site/page-parts";
import { SectionLink } from "@/components/bank-site/section-link";
import { Ph } from "@/components/bank-site/placeholder";
import { ButtonLink } from "@/components/brand/button";
import { Icon, IconDisc, type IconName } from "@/components/brand/icon";
import { CoinSeal, MonetaCardArt, MonetaCardPair } from "@/components/brand/moneta-card-art";

export const metadata: Metadata = {
  title: "Moneta | Everyday money",
  description:
    "Separate accounts for everything you're putting money toward, a debit card with real controls, and simple ways to send and track your money.",
  alternates: { canonical: "/" },
};

// Retail-bank style homepage (D1). Never describe Moneta as a bank or as
// "banking"; see LAUNCH-READINESS-PLAN 1b and 1c.1.
// Copy is original; anything needing a real fact or photo is an amber
// <Ph>/<PhotoPlaceholder>. Claims here are checked against the code — see
// LAUNCH-READINESS-PLAN 3.4 before adding new ones.
export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <NoticeStrip />
      <Welcome />
      <Products />
      <CardDesign />
      <WhyMoneta />
      <SecurityBand />
      <Help />
      <ClosingCta
        title="Ready to bank with Moneta?"
        body={
          <>
            Apply in a few minutes. Identity checks run securely through
            Dakota — you&apos;ll need a government-issued ID.
          </>
        }
      />
    </SiteShell>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-stone-field relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          // Seamless tile (generated from a periodic height field), so
          // repeats line up with no visible seams.
          backgroundImage: "url(/images/patterns/topo-forest.svg)",
          backgroundSize: "900px",
          backgroundPosition: "center top",
        }}
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:py-16">
        <div className="engraved bg-white/90 p-8 shadow-[0_24px_60px_-34px_rgba(18,46,46,0.45)] backdrop-blur-sm [--r:24px] lg:p-11">
          <p className="eyebrow text-copper">Personal accounts</p>
          <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.015em] lg:text-[46px]">
            Money that keeps up with you
          </h1>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-forest/70">
            Separate accounts for everything you&apos;re putting money toward,
            each with its own card. Move money between them in seconds and always see
            where it goes.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href="/register" size="lg" arrow>
              Open an account
            </ButtonLink>
            <Link href="/how-it-works" className="ulink text-[15px] font-semibold text-forest">
              See how it works
            </Link>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[460px] py-2">
          <div aria-hidden className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-turquoise/25 blur-3xl" />
          <MonetaCardPair tint="smoked" animate className="relative" />
          <figcaption className="relative -mt-2 text-center text-[12px] text-forest/65">
            The Moneta card · Smoked forest · design preview
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function NoticeStrip() {
  return (
    <div className="bg-white">
      <div aria-hidden className="rule-engraved" />
      <p className="mx-auto max-w-[1200px] px-4 py-3 text-center text-[13px] text-forest/75 lg:px-8">
        <span className="font-semibold text-forest">How your money moves:</span>{" "}
        deposits arrive by ACH or wire through Dakota&apos;s regulated rails and
        convert to digital dollars automatically.
      </p>
    </div>
  );
}

// ─── Welcome: quick links + two feature cards ──────────────────────────────

const QUICK_LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: "Fees & limits", href: "#help", icon: "fees" },
  { label: "Fraud & security", href: "/security", icon: "protection" },
  { label: "Set up two-step sign-in", href: "/security", icon: "two-step" },
  { label: "Help & FAQ", href: "#help", icon: "support" },
];

function Welcome() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="eyebrow text-copper">Everyday money</p>
        <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
          Your money, in one clear place
        </h2>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1fr_1fr]">
        <aside className="rounded-[18px] bg-forest p-6 text-white [--icon-signal:#4ac280]">
          <h3 className="text-[17px] font-semibold">Quick links</h3>
          <div className="mt-5 rounded-[14px] bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-[14px] text-white/80">
              <Icon name="accounts" size={17} />
              New to Moneta?
            </div>
            <ButtonLink href="/register" variant="on-dark" size="sm" className="mt-3">
              Open an account
            </ButtonLink>
            <Link href="/login" className="mt-3 flex items-center gap-1 text-[13px] text-white/70 hover:text-white">
              Already a member? Sign in <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-3">
            {QUICK_LINKS.map((q) => (
              <li key={q.label}>
                <SectionLink
                  href={q.href}
                  className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[14px] text-white/85 transition-colors last:border-b-0 hover:text-white"
                >
                  <Icon name={q.icon} size={18} className="text-white/85" />
                  {q.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </aside>

        <FeatureCard
          media={
            <Image
              src="/images/photos/trust-friends.jpg"
              alt="Two friends laughing together"
              width={800}
              height={533}
              className="h-48 w-full object-cover"
            />
          }
          eyebrow="Send & transfer"
          title="Pay a friend back in a few taps"
          body="Send money to people you know, or move it between your own accounts the moment you need to."
          link={{ label: "How sending works", href: "#transfers" }}
        />
        <FeatureCard
          media={
            <div className="flex h-48 items-center justify-center bg-[radial-gradient(ellipse_75%_70%_at_50%_55%,#f8faf9_0%,#e6ece9_70%,#dce4e0_100%)] px-10">
              <MonetaCardArt side="front" tint="smoked" className="max-w-[250px] -rotate-3 transition-transform duration-500 group-hover:rotate-0" />
            </div>
          }
          eyebrow="Card controls"
          title="Your card, on your terms"
          body="Freeze it in a tap if it goes missing, and unfreeze it the moment it turns up."
          link={{ label: "Explore card controls", href: "#cards" }}
        />
      </div>
    </section>
  );
}

function FeatureCard({
  media,
  eyebrow,
  title,
  body,
  link,
}: {
  media: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  link: { label: string; href: string };
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[18px] border border-forest/[0.08] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-20px_rgba(18,46,46,0.25)]">
      <div className="overflow-hidden">{media}</div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-[10px] text-forest/65">{eyebrow}</p>
        <h3 className="mt-2 text-[19px] font-semibold leading-snug">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-forest/65">{body}</p>
        <SectionLink
          href={link.href}
          className="mt-auto inline-flex items-center gap-1 pt-5 text-[14px] font-semibold text-turquoise-700 hover:underline"
        >
          {link.label} <ChevronRight className="h-4 w-4" />
        </SectionLink>
      </div>
    </article>
  );
}

// ─── Products ───────────────────────────────────────────────────────────────

const PRODUCTS: {
  id: string;
  icon: IconName;
  title: string;
  lead: string;
  points: React.ReactNode[];
}[] = [
  {
    id: "accounts",
    icon: "accounts",
    title: "Accounts",
    lead: "As many as you need, each with its own name.",
    points: [
      "One for bills, one for spending, one for the holiday",
      "Set a goal on any account and watch it grow",
      "Every account and balance in one view",
    ],
  },
  {
    id: "cards",
    icon: "card",
    title: "Debit card",
    lead: "A virtual Visa debit card with controls you actually use.",
    points: [
      "Use it online as soon as it's issued",
      "Freeze it instantly if it goes missing, and unfreeze it in a tap",
    ],
  },
  {
    id: "transfers",
    icon: "send",
    title: "Send & transfer",
    lead: "Move money where it needs to go.",
    points: [
      "Send money to people you know",
      "Transfer between your Moneta accounts in seconds",
      "Schedule recurring transfers",
      "Deposit from or withdraw to your other bank by ACH (typically 1–3 business days) or same-day wire",
    ],
  },
  {
    id: "insights",
    icon: "insights",
    title: "Spending insights",
    lead: "Know where your money goes each month.",
    points: [
      "Spending sorted into categories automatically",
      "Monthly budgets with progress you can see",
      "Month-over-month comparisons",
    ],
  },
];

function Products() {
  return (
    <section className="bg-smoke relative overflow-hidden text-white [--icon-signal:#4ac280]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url(/images/patterns/topo-white.svg)", backgroundSize: "900px", backgroundPosition: "center top" }}
      />
      <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-24">
        <div className="max-w-[60ch]">
          <p className="eyebrow text-copper-light">With Moneta</p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
            Everything for your everyday money
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-white/65">
            No mortgages, loans or investment products — just the accounts,
            cards and tools you use every day, done well.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="group relative scroll-mt-40 overflow-hidden rounded-[18px] bg-white/[0.045] p-7 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/[0.07] lg:p-8"
            >
              {/* Copper hairline, like the edge of the card */}
              <span aria-hidden className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-copper-line/70 to-transparent" />
              <Icon name={p.icon} size={30} className="text-white" />
              <h3 className="mt-5 text-[21px] font-semibold">{p.title}</h3>
              <p className="mt-1 text-[15px] text-white/60">{p.lead}</p>
              <ul className="mt-5 space-y-2.5">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-white/85">
                    <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rotate-45 bg-copper-light" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The card ───────────────────────────────────────────────────────────────

function CardDesign() {
  return (
    <section id="card-design" className="relative scroll-mt-40 overflow-hidden bg-[radial-gradient(ellipse_75%_70%_at_50%_55%,#f8faf9_0%,#e6ece9_70%,#dce4e0_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url(/images/patterns/topo-forest.svg)", backgroundSize: "900px", backgroundPosition: "center top" }}
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow text-copper">The Moneta card</p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
            Struck like a coin, smoked like glass
          </h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-forest/70">
            A see-through, smoked-forest card with the Moneta coin struck in copper. Moneta was the Roman mint
            where money got its name.
          </p>
          <ul className="mt-6 space-y-2.5 text-[14.5px] text-forest/75">
            <li className="flex gap-2.5">
              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-turquoise" />
              Your name and number live on the back, so the front stays clean
            </li>
            <li className="flex gap-2.5">
              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-turquoise" />
              The coin sits just above the Visa mark, and the back shows through the tint
            </li>
          </ul>
          <p className="mt-6 max-w-[52ch] rounded-[12px] bg-white/70 px-4 py-3 text-[13px] leading-relaxed text-forest/65 ring-1 ring-forest/[0.08]">
            Design preview. At launch your Moneta card is a virtual Visa debit card you can use online as soon as
            it&apos;s issued.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <figure>
            <MonetaCardArt side="front" tint="smoked" />
            <figcaption className="mt-3 text-center text-[13px] font-medium text-forest/65">Front</figcaption>
          </figure>
          <figure>
            <MonetaCardArt side="back" tint="smoked" />
            <figcaption className="mt-3 text-center text-[13px] font-medium text-forest/65">Back</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

// ─── Why Moneta ─────────────────────────────────────────────────────────────

const REASONS: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: "reserve",
    title: "Fully reserved",
    body: (
      <>
        Your balance is held as USDC, a digital dollar fully reserved by its
        issuer with cash and short-term US government securities.{" "}
        <Link href="/security" className="font-medium text-turquoise-700 hover:underline">
          See where your money sits
        </Link>
      </>
    ),
  },
  {
    icon: "fees",
    title: "Fees you can see",
    body: "Moving money between your own accounts is free. Where a fee applies, your receipt shows it itemised, line by line.",
  },
  {
    icon: "security",
    title: "Security built in",
    body: "Two-step sign-in, instant card freeze and alerts on your account activity.",
  },
  {
    icon: "accounts",
    title: "Your own deposit details",
    body: "US account and routing numbers for direct deposit and bank transfers, provided through Dakota's regulated rails.",
  },
];

function WhyMoneta() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
      <div>
        <h2 className="font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
          Why bank with Moneta?
        </h2>
        <ul className="mt-8 space-y-7">
          {REASONS.map((r) => (
            <li key={r.title} className="flex gap-4">
              <IconDisc name={r.icon} size={48} />
              <div>
                <h3 className="text-[17px] font-semibold">{r.title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-forest/65">{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figure className="bg-smoke engraved relative flex aspect-[4/4.4] w-full flex-col items-center justify-center overflow-hidden [--r:28px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url(/images/patterns/topo-white.svg)", backgroundSize: "700px", backgroundPosition: "center" }}
        />
        <div aria-hidden className="absolute h-72 w-72 rounded-full bg-copper-line/20 blur-3xl" />
        <CoinSeal size={250} className="relative" />
        <figcaption className="relative mt-8 text-center">
          <span className="block font-mono text-[12px] font-medium tracking-[0.32em] text-copper-light">MONETA · FIDES · MMXXVI</span>
          <span className="mt-2 block text-[13px] text-white/55">Fides is Latin for trust. It&apos;s struck into the Moneta coin.</span>
        </figcaption>
      </figure>
    </section>
  );
}

// ─── Security band ──────────────────────────────────────────────────────────

const SECURITY: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: "two-step",
    title: "Two-step sign-in",
    body: "Add an authenticator app and backup codes so only you can get in. Money can't move until it's on.",
  },
  {
    icon: "freeze",
    title: "Freeze your card instantly",
    body: "Lost it? Lock it from your account in seconds, and unlock it when it turns up.",
  },
  {
    icon: "alerts",
    title: "Activity alerts",
    body: "Notifications when money moves in or out of your accounts.",
  },
];

function SecurityBand() {
  return (
    <section className="bg-smoke relative overflow-hidden text-white [--icon-signal:#4ac280]">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[52ch]">
            <p className="eyebrow text-copper-light">Security centre</p>
            <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
              Protecting your money comes first
            </h2>
          </div>
          <ButtonLink href="/security" variant="on-dark" arrow className="self-start lg:self-auto">
            Visit the Security centre
          </ButtonLink>
        </div>
        <div className="rule-engraved mt-10 opacity-70" aria-hidden />
        <div className="grid divide-y divide-copper-line/25 md:grid-cols-3 md:divide-x md:divide-y-0">
          {SECURITY.map((s) => (
            <div key={s.title} className="py-7 md:px-8 md:py-9 md:first:pl-0 md:last:pr-0">
              <Icon name={s.icon} size={28} className="text-white" />
              <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 text-[13px] text-white/70 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2">
            <Icon name="protection" size={17} className="text-white/80" />
            Moneta will never ask for your password or one-time codes by phone,
            text or email.
          </p>
          <p className="text-white/50">Built on Dakota&apos;s regulated infrastructure</p>
        </div>
      </div>
    </section>
  );
}

// ─── Help ───────────────────────────────────────────────────────────────────

const HELP: { icon: IconName; title: string; body: React.ReactNode; href: string }[] = [
  {
    icon: "support",
    title: "Help & FAQ",
    body: "Start with how Moneta works — accounts, deposits and transfers explained.",
    href: "/how-it-works",
  },
  {
    icon: "alerts",
    title: "Contact us",
    body: <Ph>support email and support hours</Ph>,
    href: "#help",
  },
  {
    icon: "protection",
    title: "Report fraud or a lost card",
    body: "Freeze your card from your account right away — one tap, and you can undo it.",
    href: "/security",
  },
  {
    icon: "fees",
    title: "Fees & limits",
    body: "Moving money between your own accounts is free. For bank withdrawals, every fee is itemised on your receipt.",
    href: "#help",
  },
];

function Help() {
  return (
    <section id="help" className="bg-stone-field scroll-mt-40">
      <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <h2 className="font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
          How can we help?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HELP.map((h) => (
            <SectionLink
              key={h.title}
              href={h.href}
              className="group flex flex-col rounded-[18px] border border-forest/[0.08] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(18,46,46,0.35)]"
            >
              <Icon name={h.icon} size={28} className="text-forest" />
              <h3 className="mt-4 flex items-center gap-1 text-[16px] font-semibold">
                {h.title}
                <ChevronRight className="h-4 w-4 text-forest/40 transition group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest/65">{h.body}</p>
            </SectionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
