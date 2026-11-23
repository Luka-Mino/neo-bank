"use client";

// Recipients — /app version of (dashboard)/recipients.
// GET /api/recipients (people) + GET /api/destinations?type=crypto (their
// saved USDC wallets). Someone is payable once they have a wallet saved; Pay
// goes to Send with that wallet preselected.

import { useMemo } from "react";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { Avatar } from "@/components/app/picker";
import { EmptyState, ErrorState, LoadingRows } from "@/components/app/states";
import { shortAddress, usePayees, useRecipients } from "@/components/app/data";
import { ButtonLink } from "@/components/brand/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function RecipientsPage() {
  const { recipients, isLoading: rLoading, isError: rError, refetch } = useRecipients();
  const { payees, isLoading: pLoading } = usePayees();

  const rows = useMemo(
    () =>
      recipients
        .map((r) => ({ ...r, wallets: payees.filter((p) => p.recipientId === r.id) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [recipients, payees]
  );
  const loading = rLoading || pLoading;

  return (
    <div className="pb-10 lg:pb-16">
      <header className="bg-forest text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-8")}>
          <Link href="/app/move" className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Move money
          </Link>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Recipients</h1>
              <p className="mt-1 text-[14px] text-white/65">People you pay, and their saved wallets.</p>
            </div>
            <ButtonLink href="/app/move/recipients/new" variant="on-dark" size="sm" className="shrink-0">
              Add someone
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "mt-5 lg:mt-8")}>
        <div className="mx-4 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0 lg:max-w-[760px]">
          {loading ? (
            <LoadingRows rows={4} label="Loading recipients" />
          ) : rError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon="send"
              title="No one saved yet"
              body="Add someone with their USDC wallet address, and you can pay them in seconds."
              action={
                <ButtonLink href="/app/move/recipients/new" arrow>
                  Add someone
                </ButtonLink>
              }
            />
          ) : (
            <ul className="divide-y divide-forest/[0.06]">
              {rows.map((r) => {
                const wallet = r.wallets[0];
                return (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                    <Avatar name={r.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-forest">{r.name}</p>
                      <p className={cn("mt-0.5 truncate text-[12.5px]", wallet ? "font-mono text-forest/55" : "text-forest/45")}>
                        {wallet ? `USDC wallet ${shortAddress(wallet.address)}` : "No wallet saved yet"}
                        {r.wallets.length > 1 ? ` +${r.wallets.length - 1}` : ""}
                      </p>
                    </div>
                    {wallet ? (
                      <ButtonLink href={`/app/move/send?to=${encodeURIComponent(wallet.destinationId)}`} size="sm" variant="secondary">
                        Pay
                      </ButtonLink>
                    ) : (
                      <ButtonLink
                        href={`/app/move/recipients/new?recipient=${encodeURIComponent(r.id)}&name=${encodeURIComponent(r.name)}`}
                        size="sm"
                        variant="quiet"
                      >
                        Add wallet
                      </ButtonLink>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
