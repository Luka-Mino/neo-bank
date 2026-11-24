"use client";

// Large amount entry for money screens. Tabular figures, a currency label,
// "Available" + Max when a balance is known, optional quick-pick presets.
// Typing is sanitised (see src/lib/money-input.ts); validation messages come
// from the caller so each flow can apply its own limits.

import { useId } from "react";
import { cn } from "@/lib/utils";
import { formatUsd, sanitizeAmount } from "@/lib/money-input";

export function AmountInput({
  value,
  onChange,
  label = "Amount",
  currency = "USD",
  available,
  presets,
  error,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  currency?: string;
  /** Spendable balance; shows "Available" and a Max button. */
  available?: number;
  presets?: number[];
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;

  return (
    <div
      className={cn(
        "rounded-[18px] bg-[#f3f5f4] px-5 pb-4 pt-4 ring-1 ring-inset transition-shadow",
        error ? "ring-[#c4363b]/50" : "ring-transparent focus-within:ring-forest/25"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/65">
          {label}
        </label>
        {available !== undefined && (
          <div id={hintId} className="flex items-center gap-2 text-[12.5px] text-forest/65">
            <span className="tabular">{formatUsd(available)} available</span>
            <button
              type="button"
              disabled={disabled || available <= 0}
              onClick={() => onChange(available.toFixed(2))}
              className="rounded-[8px] bg-white px-2 py-0.5 text-[12px] font-semibold text-turquoise-700 ring-1 ring-forest/10 transition hover:text-forest disabled:opacity-40 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
            >
              Max
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span aria-hidden className="text-[34px] font-semibold leading-none text-forest/40 lg:text-[40px]">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="0.00"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errId : null, available !== undefined ? hintId : null].filter(Boolean).join(" ") || undefined}
          onChange={(e) => onChange(sanitizeAmount(e.target.value))}
          className="tabular min-w-0 flex-1 bg-transparent text-[34px] font-semibold leading-none tracking-[-0.02em] text-forest outline-none placeholder:text-forest/25 disabled:opacity-60 lg:text-[40px]"
        />
        <span className="text-[13px] font-semibold text-forest/65">{currency}</span>
      </div>

      {presets && presets.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onChange(String(p))}
              className="tabular rounded-[10px] bg-white px-3 py-1.5 text-[13px] font-medium text-forest ring-1 ring-forest/10 transition hover:ring-forest/30 disabled:opacity-40 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
            >
              {formatUsd(p).replace(".00", "")}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p id={errId} role="alert" className="mt-2.5 text-[13px] font-medium text-[#b42f34]">
          {error}
        </p>
      )}
    </div>
  );
}
