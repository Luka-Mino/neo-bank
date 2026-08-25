"use client";

// Product story — three narrative bands, each anchored by a recreation of the
// REAL product UI (not icons, not stock metaphors). Light throughout, alternating
// white/marble so the page reads as chapters. Tabular mono figures are the
// through-line: this is a product about exact money.

import { Copy, Check, ArrowUpRight } from "lucide-react";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f8f5c]">
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
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(18,46,46,0.05),0_28px_60px_-32px_rgba(18,46,46,0.28)] ring-1 ring-[#122e2e]/[0.07]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#122e2e]">Deposit details</p>
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
              <p className="text-[11px] uppercase tracking-wider text-[#122e2e]/45">
                {r.label}
              </p>
              <p className="font-mono text-[15px] font-medium tabular-nums text-[#122e2e]">
                {r.value}
              </p>
            </div>
            {i === 0 ? (
              <Check className="h-4 w-4 text-[#2f8f5c]" />
            ) : (
              <Copy className="h-4 w-4 text-[#122e2e]/35" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#122e2e]/55">
        Income sent to these details lands as digital dollars in your Moneta
        balance — spendable the moment it settles.
      </p>
    </div>
  );
}

// ── Chapter 2: money that actually arrives now ──────────────────────────────

function SendVisual() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(18,46,46,0.05),0_28px_60px_-32px_rgba(18,46,46,0.28)] ring-1 ring-[#122e2e]/[0.07]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#122e2e] font-display text-sm font-bold text-[#4ac280]">
          MR
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#122e2e]">To Maria Rodriguez</p>
          <p className="text-xs text-[#5b6b6b]">Moneta member</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#2f8f5c]" />
      </div>
      <p className="font-display mt-5 text-4xl font-semibold tabular-nums text-[#122e2e]">
        $250<span className="text-[#122e2e]/35">.00</span>
      </p>
      <div className="mt-5 space-y-2 border-t border-[#122e2e]/[0.08] pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[#5b6b6b]">Sent</span>
          <span className="font-mono tabular-nums text-[#122e2e]">2:14:09 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5b6b6b]">Arrived</span>
          <span className="font-mono tabular-nums text-[#2f8f5c]">2:14:12 PM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5b6b6b]">Fee</span>
          <span className="font-mono tabular-nums text-[#122e2e]">$0.00</span>
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
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(18,46,46,0.05),0_28px_60px_-32px_rgba(18,46,46,0.28)] ring-1 ring-[#122e2e]/[0.07]">
      <p className="text-sm font-semibold text-[#122e2e]">Withdrawal receipt</p>
      <div className="mt-4 space-y-2 text-sm">
        {lines.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-[#5b6b6b]">{label}</span>
            <span className="font-mono tabular-nums text-[#122e2e]">{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[#122e2e]/10 pt-2 font-semibold">
          <span className="text-[#122e2e]">Total debited</span>
          <span className="font-mono tabular-nums text-[#122e2e]">$1,001.22</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-[#f6f6f6] px-4 py-3">
        <p className="text-[11px] uppercase tracking-wider text-[#122e2e]/45">
          On the receiving statement
        </p>
        <p className="font-mono text-[15px] font-medium text-[#122e2e]">
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
          className={i % 2 === 1 ? "bg-white" : "bg-[#f6f6f6]"}
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
                <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#122e2e] md:text-4xl">
                  {c.title}
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#5b6b6b] lg:mx-0">
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
