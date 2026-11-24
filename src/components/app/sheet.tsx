"use client";

// AppSheet — the one overlay used across /app.
//   phone   bottom sheet (slides up, grab handle, safe-area padding)
//   ≥ lg    centred dialog
// Built on base-ui Dialog: focus trap, Escape, scroll lock and labelling
// come from the primitive. Pass `busy` while a request is in flight so the
// sheet can't be dismissed halfway through a money movement.

import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  busy = false,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Sticky action area (buttons). */
  footer?: ReactNode;
  /** Blocks every way of closing (Escape, backdrop, ✕) while true. */
  busy?: boolean;
  className?: string;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
      disablePointerDismissal={busy}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-forest-900/40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex max-h-[92dvh] flex-col bg-white text-forest shadow-[0_-8px_40px_-12px_rgba(10,28,28,0.35)] outline-none",
            "transition-[transform,opacity] duration-200 ease-out",
            // phone: bottom sheet
            "inset-x-0 bottom-0 rounded-t-[24px] pb-[env(safe-area-inset-bottom)]",
            "data-[starting-style]:translate-y-8 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-8 data-[ending-style]:opacity-0",
            // desktop: centred dialog
            "lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[480px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[20px] lg:pb-0",
            "lg:data-[starting-style]:-translate-y-[48%] lg:data-[ending-style]:-translate-y-[48%]",
            className
          )}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-forest/15 lg:hidden" />
          <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-2 pt-4 lg:px-7 lg:pt-6">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-[20px] font-semibold tracking-[-0.01em]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-[13.5px] leading-relaxed text-forest/65">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              disabled={busy}
              aria-label="Close"
              className="-mr-1.5 -mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-forest/65 transition hover:bg-forest/[0.05] hover:text-forest disabled:opacity-40 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 lg:px-7">
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t border-forest/[0.07] px-5 py-4 lg:px-7 lg:py-5">{footer}</div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
