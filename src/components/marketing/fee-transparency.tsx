"use client";

import { Check, X } from "lucide-react";

// The differentiator, made concrete: a side-by-side of the fees the industry
// hides vs. what Moneta does. Rows are drawn from the real grievances users
// have with fee-heavy neobanks (weekend FX markup, hidden spreads, ATM cliffs).
// We name no competitor — "the usual playbook" keeps it about the practice.

interface Row {
  label: string;
  theirs: string;
  ours: string;
}

const ROWS: Row[] = [
  { label: "Monthly account fee", theirs: "Varies by plan", ours: "$0 on Free" },
  { label: "Weekend exchange markup", theirs: "~1% when markets close", ours: "None — your balance is already dollars" },
  { label: "Hidden exchange-rate spread", theirs: "1.5–2.5% baked into the rate", ours: "Shown as a line item, upfront" },
  { label: "ATM surprise fee", theirs: "2% after a low monthly cap", ours: "Transparent, flat — no cliff" },
  { label: "Fees you see before confirming", theirs: "Rarely", ours: "Always — every fee on the receipt" },
];

export function FeeTransparency() {
  return (
    <section id="fees" className="bg-deep-forest py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
            Transparency
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Every fee on the receipt
          </h2>
          <p className="mt-4 text-lg text-white/65">
            The industry makes its money in the fine print — weekend surcharges,
            spreads buried in the exchange rate, fees you only notice after the
            money&apos;s gone. We don&apos;t. Here&apos;s the difference, line by line.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-white/10">
          {/* Header */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-white/50">
            <div className="px-4 py-3 sm:px-6">&nbsp;</div>
            <div className="px-3 py-3 sm:px-4">The usual playbook</div>
            <div className="px-3 py-3 sm:px-4 text-[#4ac280]">Moneta</div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={
                "grid grid-cols-[1.4fr_1fr_1fr] items-start border-t border-white/8 text-sm " +
                (i % 2 ? "bg-white/[0.01]" : "")
              }
            >
              <div className="px-4 py-4 font-medium text-white sm:px-6">{row.label}</div>
              <div className="flex items-start gap-2 px-3 py-4 text-white/55 sm:px-4">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                <span>{row.theirs}</span>
              </div>
              <div className="flex items-start gap-2 px-3 py-4 text-white/85 sm:px-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4ac280]" />
                <span>{row.ours}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-white/40">
          Because Moneta holds dollar-backed stablecoin, there&apos;s no currency to
          mark up for US spending — the fee others rely on simply doesn&apos;t exist here.
        </p>
      </div>
    </section>
  );
}
