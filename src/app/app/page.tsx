"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { IconDisc, type IconName } from "@/components/brand/icon";
import { MonetaCardArt } from "@/components/brand/moneta-card-art";
import { GlyphBadge } from "@/components/app/states";
import { Logo } from "@/components/shared/logo";
import {
  useAccountsQuery,
  useCardsQuery,
  type AccountRow,
  type CardRow,
} from "@/components/account/use-accounts";
import {
  greeting,
  maskNumber,
  money,
  useDisplayName,
  useTransactions,
} from "@/components/app/data";
import { NotificationBell } from "@/components/app/notification-bell";
import { OpenAccountButton } from "@/components/app/account-manage";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { ActivityRow } from "@/components/app/activity-row";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { name: "Send", href: "/app/move/send", glyph: "send" },
  { name: "Transfer", href: "/app/move/transfer", glyph: "transfer" },
  { name: "Deposit", href: "/app/move/deposit", glyph: "deposit" },
  { name: "Withdraw", href: "/app/move/withdraw", glyph: "withdraw" },
] as const satisfies readonly { name: string; href: string; glyph: IconName }[];

export default function AppHomePage() {
  // /app?open=side opens the "Open a side account" sheet (linked from the card screen).
  const openSide = useSearchParams().get("open") === "side";
  const { firstName, initials } = useDisplayName();

  const [shown, setShown] = useState(true);

  const accountsQ = useAccountsQuery();
  const accounts = (accountsQ.data ?? []).filter((a) => a.status !== "closed");
  const total = accounts.reduce((s, a) => s + Number(a.balance), 0);

  const cardsQ = useCardsQuery();
  const cards = (cardsQ.data ?? []).filter(
    (c) => c.status === "active" || c.status === "frozen",
  );

  const { txs } = useTransactions();
  const recent = txs.slice(0, 5);

  return (
    <div className="pb-8 lg:pb-14">
      {/* ── Header band ─────────────────────────────────────────────── */}
      <header className="app-band overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-turquoise/20 blur-3xl lg:right-[10%] lg:h-96 lg:w-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-[8%] hidden h-72 w-72 rounded-full bg-copper-line/10 blur-3xl lg:block"
        />

        <div
          className={cn(
            APP_CONTAINER,
            "relative px-5 pb-20 pt-[max(1.25rem,env(safe-area-inset-top))] lg:pb-28 lg:pt-10",
          )}
        >
          {/* Desktop: your card, in the space the phone layout uses for the top row. */}
          {cards[0] && (
            <Link
              href="/app/card"
              aria-label="Your Moneta card"
              className="absolute right-8 top-5 hidden w-[270px] -rotate-6 transition-transform duration-500 hover:-rotate-3 lg:block xl:w-[295px]"
            >
              <MonetaCardArt side="front" tint="smoked" last4={cards[0].last4 ?? "••••"} holder={firstName.toUpperCase()} />
            </Link>
          )}

          {/* Mobile-only top row — desktop has these in the top bar. */}
          <div className="relative flex items-center justify-between lg:hidden">
            <Logo variant="full" tone="reverse" size={24} priority />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/app/more"
                aria-label="Profile and settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-turquoise text-[12px] font-semibold text-forest-900"
              >
                {initials}
              </Link>
            </div>
          </div>

          <p
            className="relative mt-7 font-display text-[26px] font-semibold leading-tight tracking-[-0.01em] lg:mt-0 lg:text-[32px]"
            suppressHydrationWarning
          >
            {greeting()}, {firstName}
          </p>

          <div className="relative mt-5">
            <div className="eyebrow flex items-center gap-2 text-[10.5px] text-copper-light">
              Total in your accounts
              <button
                type="button"
                onClick={() => setShown((s) => !s)}
                aria-label={shown ? "Hide balances" : "Show balances"}
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {shown ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-1.5 text-[36px] font-semibold leading-none tracking-[-0.02em] tabular lg:text-[48px]">
              {accountsQ.isLoading ? (
                <span className="inline-block h-8 w-44 animate-pulse rounded-md bg-white/10" />
              ) : shown ? (
                money(total)
              ) : (
                "$•••••"
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={APP_CONTAINER}>
        {/* ── Quick actions (overlaps the band) ───────────────────────── */}
        <section
          aria-label="Quick actions"
          className="engraved relative z-10 mx-4 -mt-12 grid grid-cols-4 bg-white px-3 py-5 shadow-[0_18px_40px_-18px_rgba(10,28,28,0.35)] [--r:22px] lg:mx-0 lg:-mt-16 lg:px-4 lg:py-4"
        >
          {ACTIONS.map((a) => (
            <Link
              key={a.name}
              href={a.href}
              className="group flex flex-col items-center gap-2 rounded-xl py-1 lg:flex-row lg:justify-center lg:gap-3 lg:rounded-none lg:py-3"
            >
              <IconDisc name={a.glyph} size={48} className="transition group-hover:-translate-y-0.5 group-active:scale-95" />
              <span className="text-[12px] font-medium text-forest/80 lg:text-[15px] lg:font-semibold lg:text-forest">
                {a.name}
              </span>
            </Link>
          ))}
        </section>

        <div className="lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div>
            {/* ── Your accounts ───────────────────────────────────────────── */}
            <Section
              title="Your accounts"
              aside={shown && !accountsQ.isLoading ? money(total) : undefined}
            >
              {accountsQ.isLoading ? (
                <RowSkeleton count={3} />
              ) : accounts.length === 0 ? (
                <EmptyRow text="You don't have any open accounts yet." />
              ) : (
                accounts.map((a) => (
                  <AccountListRow key={a.id} account={a} shown={shown} />
                ))
              )}
            </Section>
            <div className="mx-4 mt-3 flex justify-end lg:mx-0">
              <OpenAccountButton autoOpen={openSide} />
            </div>

            {/* ── Cards ───────────────────────────────────────────────────── */}
            {cards.length > 0 && (
              <Section title="Cards">
                {cards.map((c) => (
                  <CardListRow
                    key={c.id}
                    card={c}
                    accountName={
                      accounts.find((a) => a.id === c.accountId)?.nickname ??
                      null
                    }
                  />
                ))}
              </Section>
            )}
          </div>

          <div className="flex flex-col">
            {/* ── Feature tile (below activity on desktop) ───────────────── */}
            <Link
              href="/app/move/send"
              className="group relative mx-4 mt-6 block overflow-hidden rounded-[20px] bg-forest text-white lg:order-2 lg:mx-0"
            >
              <Image
                src="/images/photos/trust-friends.jpg"
                alt=""
                width={800}
                height={533}
                className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03] lg:h-52"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <div className="text-[16px] font-semibold leading-snug">
                    Pay a friend back
                  </div>
                  <div className="mt-0.5 text-[13px] text-white/75">
                    Send money to people you know, right from your account.
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-turquoise text-forest-900 transition group-hover:translate-x-0.5">
                  <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </div>
            </Link>

            {/* ── Recent activity ────────────────────────────────────────── */}
            <Section
              className="lg:order-1"
              title="Recent activity"
              aside={
                <Link
                  href="/app/activity"
                  className="text-[13px] font-semibold text-turquoise-700 hover:underline"
                >
                  See all
                </Link>
              }
            >
              {recent.length === 0 ? (
                <EmptyRow text="No transactions yet." />
              ) : (
                recent.map((tx) => (
                  <ActivityRow
                    key={tx.id}
                    tx={tx}
                    accountName={
                      accounts.find((a) => a.id === tx.accountId)?.nickname ??
                      null
                    }
                  />
                ))
              )}
            </Section>
          </div>
        </div>

        <p className="mx-6 mt-8 text-center text-[12px] leading-relaxed text-forest/65 lg:mt-12">
          Built on Dakota&apos;s regulated infrastructure · Your balance is
          held as USDC and isn&apos;t FDIC-insured
        </p>
      </div>
    </div>
  );
}

// ─── Building blocks ────────────────────────────────────────────────────────

function Section({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("mx-4 mt-6 lg:mx-0 lg:mt-8", className)}>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="eyebrow text-[10.5px] text-copper">{title}</h2>
        {typeof aside === "string" ? (
          <span className="font-mono text-[13px] font-medium text-forest/65 tabular">
            {aside}
          </span>
        ) : (
          aside
        )}
      </div>
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
        {children}
      </div>
    </section>
  );
}

function AccountListRow({
  account,
  shown,
}: {
  account: AccountRow;
  shown: boolean;
}) {
  return (
    <Link
      href={`/app/accounts/${account.id}`}
      className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-forest/[0.02] active:bg-forest/[0.04]"
    >
      <GlyphBadge name={Number(account.goalAmount ?? 0) > 0 ? "goals" : "accounts"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-forest">
            {account.nickname || account.accountType}
          </span>
          {account.status === "frozen" && (
            <span className="rounded-full bg-cat-blue/10 px-2 py-0.5 text-[10px] font-semibold text-cat-blue-700">
              Frozen
            </span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[12px] text-forest/65">
          {maskNumber(account.accountNumber)}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[15px] font-semibold text-forest tabular">
          {shown ? money(Number(account.balance)) : "$••••"}
        </div>
        <div className="text-[12px] text-forest/65">Available</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-forest/30" />
    </Link>
  );
}

function CardListRow({
  card,
  accountName,
}: {
  card: CardRow;
  accountName: string | null;
}) {
  const frozen = card.status === "frozen";
  // A card belongs to one account (SIDE-ACCOUNTS-PLAN.md), so name it by its account.
  const title = accountName ? `${accountName} card` : "Card";
  return (
    <Link
      href={`/app/card?card=${encodeURIComponent(card.id)}`}
      className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-forest/[0.02] active:bg-forest/[0.04]"
    >
      <span aria-hidden className={cn("w-16 shrink-0", frozen && "opacity-60 grayscale-[0.6]")}>
        <MonetaCardArt side="front" tint="smoked" last4={card.last4 ?? "••••"} label="" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-forest">
          {title}
        </div>
        <div className="mt-0.5 text-[12px] text-forest/65">
          <span className="font-mono">•••• {card.last4}</span>
          {card.cardType === "physical" ? " · Physical" : " · Virtual"}
        </div>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-[12px] font-semibold",
          frozen
            ? "bg-cat-blue/10 text-cat-blue-700"
            : "bg-turquoise-50 text-turquoise-700",
        )}
      >
        {frozen ? "Frozen" : "Active"}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-forest/30" />
    </Link>
  );
}

function RowSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-4 last:border-b-0"
        >
          <span className="h-10 w-10 animate-pulse rounded-full bg-forest/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 animate-pulse rounded bg-forest/[0.06]" />
            <div className="h-3 w-16 animate-pulse rounded bg-forest/[0.05]" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded bg-forest/[0.06]" />
        </div>
      ))}
    </>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-4 py-6 text-center text-[13px] text-forest/65">
      {text}
    </div>
  );
}
