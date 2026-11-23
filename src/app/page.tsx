import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  KeyRound,
  Landmark,
  Lock,
  Phone,
  Receipt,
  Send,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";
import { ClosingCta, SiteShell } from "@/components/bank-site/page-parts";
import { SectionLink } from "@/components/bank-site/section-link";
import { Ph, PhotoPlaceholder } from "@/components/bank-site/placeholder";

export const metadata: Metadata = {
  title: "Moneta | Personal banking",
  description:
    "Checking, savings, a debit card with real controls, and simple ways to send and track your money.",
};

// Retail-bank style personal banking home (draft). Lives beside the current
// landing page at / for comparison. Copy is original; anything needing a real
// fact or photo is an amber <Ph>/<PhotoPlaceholder>.
export default function PersonalBankingPage() {
  return (
    <SiteShell>
      <Hero />
      <NoticeStrip />
      <Welcome />
      <Products />
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
    <section className="relative overflow-hidden bg-turquoise-50">
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
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:py-16">
        <div className="rounded-[20px] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(18,46,46,0.35)] lg:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-[12px] font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-turquoise" />
            Built on Dakota&apos;s regulated rails
          </span>
          <h1 className="mt-5 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.015em] lg:text-[46px]">
            Banking that keeps up with you
          </h1>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-forest/70">
            Checking, savings and a debit card in one place. Move money between
            your accounts instantly and always see where it goes.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-turquoise px-6 py-3 text-[15px] font-semibold text-forest-900 transition hover:bg-turquoise-600"
            >
              Open an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="ulink text-[15px] font-semibold text-forest"
            >
              See how it works
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center py-6">
          <div
            aria-hidden
            className="absolute h-72 w-72 rounded-full bg-turquoise/30 blur-3xl"
          />
          <div className="relative w-full max-w-[440px] -rotate-6 transition-transform duration-500 hover:rotate-0">
            <MonetaCard
              size="lg"
              holder="ALEX MORGAN"
              card={{
                last4: "4821",
                cardType: "physical",
                status: "active",
                expMonth: 9,
                expYear: 2030,
                network: "visa",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NoticeStrip() {
  return (
    <div className="border-y border-forest/[0.08] bg-marble">
      <p className="mx-auto max-w-[1200px] px-4 py-3 text-center text-[13px] text-forest/75 lg:px-8">
        <span className="font-semibold text-forest">How your money moves:</span>{" "}
        deposits arrive by ACH or wire through Dakota&apos;s regulated rails and
        convert to digital dollars automatically.
      </p>
    </div>
  );
}

// ─── Welcome: quick links + two feature cards ──────────────────────────────

const QUICK_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Fees & limits", href: "#help", icon: Receipt },
  { label: "Fraud & security", href: "/security", icon: ShieldCheck },
  { label: "Set up two-step sign-in", href: "/security", icon: KeyRound },
  { label: "Help & FAQ", href: "#help", icon: CircleHelp },
];

function Welcome() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="eyebrow text-turquoise-700">Moneta personal banking</p>
        <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
          Your money, in one clear place
        </h2>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1fr_1fr]">
        <aside className="rounded-[18px] bg-forest p-6 text-white">
          <h3 className="text-[17px] font-semibold">Quick links</h3>
          <div className="mt-5 rounded-[14px] bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-[14px] text-white/80">
              <UserPlus className="h-4 w-4 text-turquoise" />
              New to Moneta?
            </div>
            <Link
              href="/register"
              className="mt-3 inline-flex rounded-full bg-turquoise px-4 py-2 text-[13px] font-semibold text-forest-900 transition hover:bg-turquoise-600"
            >
              Open an account
            </Link>
            <Link
              href="/login"
              className="mt-3 flex items-center gap-1 text-[13px] text-white/70 hover:text-white"
            >
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
                  <q.icon className="h-4 w-4 text-turquoise" />
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
            <PhotoPlaceholder
              label="Person holding a debit card while shopping online"
              className="h-48 rounded-none border-x-0 border-t-0"
            />
          }
          eyebrow="Card controls"
          title="Your card, on your terms"
          body="Freeze it in a tap if it goes missing, set spending limits, and report it lost or stolen in seconds."
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
        <p className="eyebrow text-[10px] text-forest/50">{eyebrow}</p>
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
  icon: LucideIcon;
  title: string;
  lead: string;
  points: React.ReactNode[];
}[] = [
  {
    id: "accounts",
    icon: Wallet,
    title: "Checking & savings",
    lead: "Everyday spending and saving, side by side.",
    points: [
      "A checking account for day-to-day money",
      "Savings accounts with goals, so you can watch a fund grow",
      "Every account and balance in one view",
    ],
  },
  {
    id: "cards",
    icon: CreditCard,
    title: "Debit card",
    lead: "A virtual Visa debit card with controls you actually use.",
    points: [
      "Use it online as soon as it's issued",
      "Freeze and unfreeze it instantly, and set spending limits",
      "Report it lost or stolen in a tap",
    ],
  },
  {
    id: "transfers",
    icon: Send,
    title: "Send & transfer",
    lead: "Move money where it needs to go.",
    points: [
      "Send money to people you know",
      "Transfer between your Moneta accounts instantly",
      "Schedule recurring transfers",
      "Deposit from or withdraw to your other bank by ACH (typically 1–3 business days) or same-day wire",
    ],
  },
  {
    id: "insights",
    icon: BarChart3,
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
    <section className="bg-marble">
      <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <div className="max-w-[60ch]">
          <p className="eyebrow text-turquoise-700">Banking with Moneta</p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
            Everything for everyday banking
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-forest/65">
            No mortgages, loans or investment products — just the accounts,
            cards and tools you use every day, done well.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="scroll-mt-40 rounded-[18px] bg-white p-7 shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-22px_rgba(18,46,46,0.3)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-turquoise-50 text-turquoise-700 ring-1 ring-turquoise/25">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[21px] font-semibold">{p.title}</h3>
              <p className="mt-1 text-[15px] text-forest/65">{p.lead}</p>
              <ul className="mt-5 space-y-2.5">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-turquoise" />
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

// ─── Why Moneta ─────────────────────────────────────────────────────────────

const REASONS: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  {
    icon: Landmark,
    title: "Fully reserved",
    body: (
      <>
        Every dollar in your balance is backed by a real one at partner banks,
        and redeemable any time.{" "}
        <Link href="/security" className="font-medium text-turquoise-700 hover:underline">
          See where your money sits
        </Link>
      </>
    ),
  },
  {
    icon: Receipt,
    title: "Fees shown up front",
    body: (
      <>
        Where a fee applies, you&apos;ll see the exact amount before you
        confirm — never after.
      </>
    ),
  },
  {
    icon: Lock,
    title: "Security built in",
    body: "Two-step sign-in, instant card freeze and alerts on your account activity.",
  },
  {
    icon: Wallet,
    title: "Account details in your name",
    body: "Real US account and routing numbers for direct deposit, provided through Dakota's regulated rails.",
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
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-turquoise">
                <r.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{r.title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-forest/65">
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <PhotoPlaceholder
        label="Warm lifestyle photo — someone at home checking their account on a phone"
        className="aspect-[4/5] w-full rounded-[24px] lg:aspect-[4/4.6]"
      />
    </section>
  );
}

// ─── Security band ──────────────────────────────────────────────────────────

const SECURITY: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  {
    icon: KeyRound,
    title: "Two-step sign-in",
    body: "Add an authenticator app and backup codes so only you can get in.",
  },
  {
    icon: Snowflake,
    title: "Freeze your card instantly",
    body: "Lost it? Lock it from your account in seconds, and unlock it when it turns up.",
  },
  {
    icon: Bell,
    title: "Activity alerts",
    body: "Notifications when money moves in or out of your accounts.",
  },
];

function SecurityBand() {
  return (
    <section className="relative overflow-hidden bg-forest text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[52ch]">
            <p className="eyebrow text-turquoise">Security centre</p>
            <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.01em] lg:text-[38px]">
              Protecting your money comes first
            </h2>
          </div>
          <Link
            href="/security"
            className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-forest transition hover:bg-turquoise-50 lg:self-auto"
          >
            Visit the Security centre <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SECURITY.map((s) => (
            <div
              key={s.title}
              className="rounded-[18px] border border-white/10 bg-white/[0.05] p-6"
            >
              <s.icon className="h-6 w-6 text-turquoise" />
              <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 text-[13px] text-white/70">
          <ShieldAlert className="h-4 w-4 text-turquoise" />
          Moneta will never ask for your password or one-time codes by phone,
          text or email.
        </p>
      </div>
    </section>
  );
}

// ─── Help ───────────────────────────────────────────────────────────────────

const HELP: { icon: LucideIcon; title: string; body: React.ReactNode; href: string }[] = [
  {
    icon: CircleHelp,
    title: "Help & FAQ",
    body: "Start with how Moneta works — accounts, deposits and transfers explained.",
    href: "/how-it-works",
  },
  {
    icon: Phone,
    title: "Contact us",
    body: <Ph>phone number, email and support hours</Ph>,
    href: "#help",
  },
  {
    icon: ShieldAlert,
    title: "Report fraud or a lost card",
    body: "Freeze your card from your account right away — one tap, and you can undo it.",
    href: "/security",
  },
  {
    icon: FileText,
    title: "Fees & limits",
    body: "Moving money between your own accounts is free. For bank withdrawals you see the exact fee before you confirm.",
    href: "#help",
  },
];

function Help() {
  return (
    <section id="help" className="scroll-mt-40 bg-marble">
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
              <h.icon className="h-6 w-6 text-turquoise-700" />
              <h3 className="mt-4 flex items-center gap-1 text-[16px] font-semibold">
                {h.title}
                <ChevronRight className="h-4 w-4 text-forest/40 transition group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest/65">
                {h.body}
              </p>
            </SectionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
