"use client";

// Product story — replaces the generic icon-grid features section. Three
// narrative bands, each anchored by a recreation of the REAL product UI
// (not icons, not stock metaphors). Bands alternate marble/forest so the
// page reads as chapters, not a scroll of identical sections.

import { Copy, Check, ArrowUpRight } from "lucide-react";

function SectionEyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={
        "text-xs font-semibold uppercase tracking-[0.22em] " +
        (dark ? "text-[#4ac280]" : "text-[#2f8f5c]")
      }
    >
      {children}
    </p>
  );
}

// ── Chapter 1: your own account & routing numbers ───────────────────────────

function BankDetailsVisual() {
  const rows = [
    { label: "Routing number", value: "084009519" },
    { label: "Account number", value: "9876543210" },
  ];
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-28px_rgba(18,46,46,0.35)] ring-1 ring-[#122e2e]/8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#212020]">Your deposit details</p>
        <span className="rounded-full bg-[#4ac280]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2f8f5c]">
          ACH &amp; wire
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-xl bg-[#f6f6f6] px-4 py-3"
          >
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#212020]/50">
                {r.label}
              </p>
              <p className="font-mono text-[15px] font-medium tabular-nums text-[#212020]">
                {r.value}
              </p>
            </div>
            {i === 0 ? (
              <Check className="h-4 w-4 text-[#2f8f5c]" />
            ) : (
              <Copy className="h-4 w-4 text-[#212020]/40" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#212020]/55">
        Your salary, your tax refund, a friend&apos;s bank transfer — anything
        sent here lands as digital dollars in your Moneta balance.
      </p>
    </div>
  );
}

// ── Chapter 2: sending money that actually arrives now ──────────────────────

function SendVisual() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-[#0d2424] p-6 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4ac280] font-display text-sm font-bold text-[#122e2e]">
          MR
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">To Maria Rodriguez</p>
          <p className="text-xs text-white/50">Moneta member</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#4ac280]" />
      </div>
      <p className="mt-5 font-display text-4xl font-semibold tabular-nums text-white">
        $250<span className="text-white/40">.00</span>
      </p>
      <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Sent</span>
          <span className="tabular-nums text-white/80">2:14:09 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Arrived</span>
          <span className="tabular-nums text-[#4ac280]">2:14:12 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Fee</span>
          <span className="tabular-nums text-white/80">$0.00</span>
        </div>
      </div>
    </div>
  );
}

// ── Chapter 3: honest receipts ───────────────────────────────────────────────

function ReceiptVisual() {
  const lines = [
    ["Sent to your bank", "$1,000.00"],
    ["Transfer fee", "$1.20"],
    ["Network fee", "$0.02"],
  ];
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-28px_rgba(18,46,46,0.35)] ring-1 ring-[#122e2e]/8">
      <p className="text-sm font-semibold text-[#212020]">Withdrawal receipt</p>
      <div className="mt-4 space-y-2 text-sm">
        {lines.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-[#212020]/55">{label}</span>
            <span className="font-mono tabular-nums text-[#212020]">{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[#122e2e]/10 pt-2 font-semibold">
          <span className="text-[#212020]">Total debited</span>
          <span className="font-mono tabular-nums text-[#212020]">$1,001.22</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-[#f6f6f6] px-4 py-3">
        <p className="text-[11px] uppercase tracking-wider text-[#212020]/50">
          On your bank statement
        </p>
        <p className="font-mono text-[15px] font-medium text-[#212020]">
          MONETA 7KQ2M4TX
        </p>
      </div>
    </div>
  );
}

// ── The chapters ─────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    eyebrow: "Get paid",
    title: "Real account and routing numbers, minted for you",
    body: "The moment you’re verified, Moneta issues personal US bank details in your name. Point your paycheck at them once — deposits convert to digital dollars automatically and show up spendable.",
    visual: BankDetailsVisual,
    dark: false,
  },
  {
    eyebrow: "Send",
    title: "Three seconds, not three business days",
    body: "Sending to another Moneta member settles on-chain while you watch. No cut-off times, no weekends, no “pending” limbo — the receipt shows the second it arrived.",
    visual: SendVisual,
    dark: true,
  },
  {
    eyebrow: "Trust the numbers",
    title: "Every fee, on the receipt, before and after",
    body: "No spread hidden in the exchange rate, no surprise line items. You see the exact total that leaves your balance, and the reference that will appear on the receiving bank’s statement.",
    visual: ReceiptVisual,
    dark: false,
  },
];

export function ProductStory() {
  return (
    <div id="features">
      {CHAPTERS.map((c, i) => (
        <section
          key={c.eyebrow}
          className={c.dark ? "bg-[#122e2e]" : "bg-[#f6f6f6]"}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div
              className={
                "flex flex-col items-center gap-12 lg:gap-20 " +
                (i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row")
              }
            >
              <div className="flex-1 text-center lg:text-left">
                <SectionEyebrow dark={c.dark}>{c.eyebrow}</SectionEyebrow>
                <h2
                  className={
                    "font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl " +
                    (c.dark ? "text-white" : "text-[#212020]")
                  }
                >
                  {c.title}
                </h2>
                <p
                  className={
                    "mx-auto mt-4 max-w-lg text-base leading-relaxed lg:mx-0 " +
                    (c.dark ? "text-white/65" : "text-[#212020]/65")
                  }
                >
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
