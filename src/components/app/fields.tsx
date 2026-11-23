"use client";

// Small form controls for /app screens, styled to match Picker/AmountInput.

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const LABEL = "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55";

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: { label: string; hint?: string; error?: string } & ComponentProps<"input">) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          "h-12 w-full rounded-[14px] bg-white px-3.5 text-[15px] text-forest ring-1 transition placeholder:text-forest/35",
          "outline-none focus-visible:ring-2 focus-visible:ring-turquoise",
          error ? "ring-[#c4363b]/50" : "ring-forest/12 hover:ring-forest/30"
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[13px] font-medium text-[#b42f34]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-forest/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Single-choice pill group (radio semantics). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div id={id} className={LABEL}>
        {label}
      </div>
      <div role="radiogroup" aria-labelledby={id} className="grid auto-cols-fr grid-flow-col gap-1 rounded-[14px] bg-[#f3f5f4] p-1">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-10 rounded-[10px] px-2 text-[13.5px] font-semibold transition outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
                on ? "bg-white text-forest shadow-[0_1px_3px_rgba(18,46,46,0.12)]" : "text-forest/55 hover:text-forest"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
