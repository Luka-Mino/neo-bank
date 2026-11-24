// Moneta buttons — approved style C, "rounded rectangle" (decision D2).
//
//   primary    forest fill, green arrow        main action on light surfaces
//   secondary  1.5px forest outline            the alternative action
//   on-dark    turquoise fill                  main action on forest sections
//   danger     1.5px red outline               freeze, remove, close
//   quiet      text only, soft hover           low-emphasis actions, toolbars
//
// Sizes 40 / 48 / 56. States from the board: hover lightens, press scales to
// 0.98, keyboard focus gets a 2px gap + 2px green ring, disabled goes to a
// 12% forest wash, loading shows a spinner and blocks repeat clicks.
//
// These replace the shadcn <Button> in new /app screens and the public site.
// The shadcn component stays only until the old dashboard is deleted (2.14).

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "on-dark" | "danger" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-[12px] font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "active:scale-[0.98] outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280] " +
  "disabled:pointer-events-none aria-disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-marble hover:bg-forest-700 active:bg-forest-900 " +
    "disabled:bg-forest/[0.12] disabled:text-forest/65 aria-disabled:bg-forest/[0.12] aria-disabled:text-forest/65",
  secondary:
    "border-[1.5px] border-forest bg-transparent text-forest hover:bg-forest/[0.04] active:bg-forest/[0.08] " +
    "disabled:border-forest/20 disabled:text-forest/40",
  "on-dark":
    "bg-turquoise text-forest-900 hover:bg-[#5fd092] active:bg-turquoise-600 " +
    "focus-visible:shadow-[0_0_0_2px_#122e2e,0_0_0_4px_#4ac280] disabled:bg-white/15 disabled:text-white/60",
  danger:
    "border-[1.5px] border-[#c4363b] bg-transparent text-[#b42f34] hover:bg-[#c4363b]/[0.06] active:bg-[#c4363b]/[0.1] " +
    "disabled:border-[#c4363b]/30 disabled:text-[#b42f34]/45",
  quiet:
    "bg-transparent text-forest hover:bg-forest/[0.05] active:bg-forest/[0.09] disabled:text-forest/40",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-[18px] text-[14px]",
  md: "h-12 px-[22px] text-[15px]",
  lg: "h-14 px-[30px] text-[16px]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], block && "w-full", className);
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden
      className={cn("shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5", className)}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden className={cn("shrink-0 animate-spin", className)}>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={2.5} />
      <path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="#4ac280" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full width (money CTAs on phone). */
  block?: boolean;
  /** Trailing arrow; green on primary, current colour otherwise. */
  arrow?: boolean;
  children: ReactNode;
};

function Inner({ variant, arrow, loading, children }: { variant: ButtonVariant; arrow?: boolean; loading?: boolean; children: ReactNode }) {
  return (
    <>
      {loading && <Spinner />}
      {children}
      {arrow && !loading && <Arrow className={variant === "primary" ? "text-turquoise" : undefined} />}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  arrow,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: Common & { loading?: boolean } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, block, className: cn("group/btn", className) })}
      {...props}
    >
      <Inner variant={variant} arrow={arrow} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  block,
  arrow,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link className={buttonClasses({ variant, size, block, className: cn("group/btn", className) })} {...props}>
      <Inner variant={variant} arrow={arrow}>
        {children}
      </Inner>
    </Link>
  );
}

/** Text link with arrow (the board's tertiary action). */
export function TextLink({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode }) {
  return (
    <Link
      className={cn(
        "group/btn inline-flex items-center gap-1.5 rounded-md font-semibold text-turquoise-700 transition-colors hover:text-forest",
        "outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
        className
      )}
      {...props}
    >
      {children}
      <Arrow className="h-4 w-4" />
    </Link>
  );
}

/** Square icon button. `label` is required: it is the accessible name. */
export function IconButton({
  label,
  size = "sm",
  tone = "light",
  className,
  children,
  type = "button",
  ...props
}: { label: string; size?: "sm" | "md"; tone?: "light" | "dark"; children: ReactNode } & Omit<
  ComponentProps<"button">,
  "children" | "aria-label"
>) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[12px] transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.96]",
        "outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
        size === "sm" ? "h-10 w-10" : "h-12 w-12",
        tone === "light"
          ? "border-[1.5px] border-forest/15 bg-white text-forest hover:border-forest/30"
          : "text-white/80 hover:bg-white/10 hover:text-white focus-visible:shadow-[0_0_0_2px_#122e2e,0_0_0_4px_#4ac280]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
