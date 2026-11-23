"use client";

// Picker — a form field that opens an AppSheet list. Used for "from account",
// recipients and linked banks. The field shows the chosen option the way a
// bank app does (avatar, name, secondary line) rather than a bare <select>.

import { useId, useState, type ReactNode } from "react";
import { AppSheet } from "@/components/app/sheet";
import { cn } from "@/lib/utils";

export type PickerOption = {
  id: string;
  title: string;
  subtitle?: string;
  /** Right-aligned detail, e.g. a balance. */
  trailing?: string;
  leading?: ReactNode;
  disabled?: boolean;
};

export function Avatar({ name, tone = "mint" }: { name: string; tone?: "mint" | "forest" }) {
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "•";
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
        tone === "mint" ? "bg-turquoise-50 text-turquoise-700" : "bg-forest text-marble"
      )}
    >
      {initials}
    </span>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden className="shrink-0 text-forest/35">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden className="shrink-0 text-turquoise-700">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Picker({
  label,
  sheetTitle,
  options,
  value,
  onChange,
  placeholder = "Choose",
  loading = false,
  disabled = false,
  error,
  empty,
  footer,
}: {
  label: string;
  sheetTitle?: string;
  options: PickerOption[];
  value: string | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  /** Shown in the sheet when there are no options. */
  empty?: ReactNode;
  /** Extra row(s) under the list, e.g. "Add a recipient". */
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = options.find((o) => o.id === value);
  const locked = disabled || loading;

  return (
    <div>
      <div id={`${id}-label`} className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55">
        {label}
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 text-left ring-1 transition",
          "outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
          error ? "ring-[#c4363b]/50" : "ring-forest/12 hover:ring-forest/30",
          locked && "cursor-default opacity-70 hover:ring-forest/12"
        )}
      >
        {current?.leading ?? (current ? <Avatar name={current.title} /> : null)}
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <span className={cn("block truncate text-[15px] font-semibold", !current && "font-medium text-forest/50")}>
            {loading ? "Loading…" : current ? current.title : placeholder}
          </span>
          {current?.subtitle && (
            <span className="mt-0.5 block truncate text-[12.5px] text-forest/55">{current.subtitle}</span>
          )}
        </span>
        {current?.trailing && <span className="tabular shrink-0 text-[13px] font-medium text-forest/70">{current.trailing}</span>}
        <Chevron />
      </button>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[13px] font-medium text-[#b42f34]">
          {error}
        </p>
      )}

      <AppSheet open={open} onOpenChange={setOpen} title={sheetTitle ?? label}>
        {options.length === 0 ? (
          <div className="py-6 text-center text-[14px] text-forest/60">{empty ?? "Nothing here yet."}</div>
        ) : (
          <ul role="listbox" aria-label={sheetTitle ?? label} className="-mx-2">
            {options.map((o) => {
              const selected = o.id === value;
              return (
                <li key={o.id} role="option" aria-selected={selected} aria-disabled={o.disabled || undefined}>
                  <button
                    type="button"
                    disabled={o.disabled}
                    onClick={() => {
                      onChange(o.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[12px] px-2 py-2.5 text-left transition",
                      "outline-none focus-visible:shadow-[inset_0_0_0_2px_#4ac280]",
                      selected ? "bg-turquoise-50/70" : "hover:bg-forest/[0.03]",
                      o.disabled && "opacity-45"
                    )}
                  >
                    {o.leading ?? <Avatar name={o.title} />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{o.title}</span>
                      {o.subtitle && <span className="mt-0.5 block truncate text-[12.5px] text-forest/55">{o.subtitle}</span>}
                    </span>
                    {o.trailing && <span className="tabular shrink-0 text-[13px] font-medium text-forest/70">{o.trailing}</span>}
                    {selected && <Check />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {footer && <div className="mt-3 border-t border-forest/[0.07] pt-3">{footer}</div>}
      </AppSheet>
    </div>
  );
}
