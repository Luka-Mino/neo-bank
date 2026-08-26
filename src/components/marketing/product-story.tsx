"use client";

// Product story — three narrative bands, each anchored by a recreation of the
// REAL product UI. Dark-first: deep-forest bands, elevated cards, mono tabular
// figures as the through-line.

import { Copy, Check, ArrowUpRight } from "lucide-react";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
      {children}
    </p>
  );
}

const CARD =
  "hover-lift mx-auto w-full max-w-md rounded-2xl bg-[#12302e] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.08]";

// ── Chapter 1 ───────────────────────────────────────────────────────────────

function BankDetailsVisual() {
  const rows = [
    { label: "Routing number", value: "084009519" },
    { label: "Account number", value: "9876543210" },
  ];
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#f6f6f6]">Deposit details</p>
        <span className="rounded-full bg-[#4ac280]/12 px-2.5 py-1 text-[11px] font-semibold text-[#4ac280]">
          ACH &amp; wire
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-xl bg-[#0a1c1c] px-4 py-3 ring-1 ring-white/[0.05]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                {r.label}
              </p>
              <p className="font-mono text-[15px] font-medium tabular-nums text-[#eef3f1]">
                {r.value}
              </p>
            </div>
            {i === 0 ? (
              <Check className="h-4 w-4 text-[#4ac280]" />
            ) : (
              <Copy className="h-4 w-4 text-white/35" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-white/55">
        Income sent to these details lands as digital dollars in your Moneta
        balance — spendable the moment it settles.
      </p>
    </div>
  );
}

// ── Chapter 2 ───────────────────────────────────────────────────────────────

function SendVisual() {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4ac280] font-display text-sm font-bold text-[#0a1c1c]">
          MR
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#f6f6f6]">To Maria Rodriguez</p>
          <p className="text-xs text-white/50">Moneta member</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#4ac280]" />
      </div>
      <p className="font-display mt-5 text-4xl font-semibold tabular-nums text-[#f6f6f6]">
        $250<span className="text-white/35">.00</span>
      </p>
      <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Sent</span>
          <span className="font-mono tabular-nums text-white/85">2:14:09 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Arrived</span>
          <span className="font-mono tabular-nums text-[#4ac280]">2:14:12 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Fee</span>
          <span className="font-mono tabular-nums text-white/85">$0.00</span>
        </div>
      </div>
    </div>
  );
}

// ── Chapter 3 ───────────────────────────────────────────────────────────────

function ReceiptVisual() {
  const lines = [
    ["Sent to your bank", "$1,000.00"],
    ["Transfer fee", "$1.20"],
    ["Network fee", "$0.02"],
  ];
  return (
    <div className={CARD}>
      <p className="text-sm font-semibold text-[#f6f6f6]">Withdrawal receipt</p>
      <div className="mt-4 space-y-2 text-sm">
        {lines.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-white/55">{label}</span>
            <span className="font-mono tabular-nums text-[#eef3f1]">{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
          <span className="text-[#f6f6f6]">Total debited</span>
          <span className="font-mono tabular-nums text-[#f6f6f6]">$1,001.22</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-[#0a1c1c] px-4 py-3 ring-1 ring-white/[0.05]">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          On the receiving statement
        </p>
        <p className="font-mono text-[15px] font-medium text-[#eef3f1]">
          MONETA 7KQ2M4TX
        </p>
      </div>
    </div>
  );
}

// ── Chapters ─────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    eyebrow: "Get paid",
    title: "Real account and routing numbers, minted for you",
    body: "The moment you’re verified, Moneta issues US bank details in your name. Point income at them once — deposits convert to digital dollars automatically and show up spendable.",
    visual: BankDetailsVisual,
  },
  {
    eyebrow: "Send",
    title: "Three seconds, not three business days",
    body: "A transfer to another Moneta member settles on-chain while you watch. No cut-off times, no weekends, no “pending” limbo — the receipt shows the second it arrived.",
    visual: SendVisual,
  },
  {
    eyebrow: "Trust the numbers",
    title: "Every fee, on the receipt, before and after",
    body: "No spread hidden in the exchange rate, no surprise line items. You see the exact total that leaves your balance, and the reference that will appear on the receiving bank’s statement.",
    visual: ReceiptVisual,
  },
];

export function ProductStory() {
  return (
    <div id="features" className="scroll-mt-24">
      {CHAPTERS.map((c, i) => (
        <section
          key={c.eyebrow}
          className={i % 2 === 1 ? "bg-[#0a1c1c]" : "bg-[#0e2322]"}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div
              className={
                "reveal flex flex-col items-center gap-12 lg:gap-20 " +
                (i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row")
              }
            >
              <div className="flex-1 text-center lg:text-left">
                <SectionEyebrow>{c.eyebrow}</SectionEyebrow>
                <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#f6f6f6] md:text-4xl">
                  {c.title}
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65 lg:mx-0">
                  {c.body}
                </p>
              </div>
              <div className="w-full flex-1">
                <c.visual />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
