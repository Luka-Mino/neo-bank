"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAccountsQuery } from "@/components/account/use-accounts";
import { AccountManage } from "@/components/app/account-manage";
import { ActivityRow } from "@/components/app/activity-row";
import {
  statusLabel,
  dayLabel,
  maskNumber,
  money,
  useTransactions,
  type AppTx,
} from "@/components/app/data";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { cn } from "@/lib/utils";

type Tab = "activity" | "details";

export default function AppAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("activity");

  const accountsQ = useAccountsQuery();
  const account = accountsQ.data?.find((a) => a.id === id) ?? null;

  const { txs } = useTransactions();
  const accountTxs = useMemo(
    () => txs.filter((t) => t.accountId === id),
    [txs, id],
  );
  const pending = accountTxs.filter((t) => t.status === "pending");
  const posted = accountTxs.filter((t) => t.status !== "pending");
  const pendingIn = pending
    .filter((t) => t.txType === "onramp" || t.txType === "internal_in")
    .reduce((s, t) => s + Number(t.sourceAmount || 0), 0);

  if (accountsQ.isLoading) {
    return (
      <div className="bg-forest">
        <div className={cn(APP_CONTAINER, "px-5 pb-10 pt-5 lg:pb-14 lg:pt-8")}>
          <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-8 h-9 w-48 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center px-8 pt-24 text-center">
        <p className="text-[16px] font-semibold text-forest">
          We couldn&apos;t find that account
        </p>
        <p className="mt-1 text-[13px] text-forest/65">
          It may have been closed, or the link is out of date.
        </p>
        <Link
          href="/app"
          className="mt-6 rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Back to accounts
        </Link>
      </div>
    );
  }

  const name = account.nickname || "Account";
  const q = `?from=${encodeURIComponent(account.id)}`;
  const actions = [
    { name: "Send", href: `/app/move/send${q}`, icon: Send },
    { name: "Transfer", href: `/app/move/transfer${q}`, icon: ArrowLeftRight },
    { name: "Deposit", href: "/app/move/deposit", icon: ArrowDownToLine },
  ];

  return (
    <div className="pb-8 lg:pb-14">
      {/* ── Header band ─────────────────────────────────────────────── */}
      <header className="app-band text-white">
        <div
          className={cn(
            APP_CONTAINER,
            "px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-6",
          )}
        >
          <div className="flex items-center gap-1">
            <Link
              href="/app"
              aria-label="Back to accounts"
              className="-ml-1 flex h-9 items-center justify-center gap-1 rounded-full pr-1 text-white/85 transition hover:bg-white/10 lg:-ml-2 lg:pl-1 lg:pr-3 lg:text-[13px] lg:font-medium lg:text-white/60 lg:hover:text-white"
            >
              <ChevronLeft className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">Accounts</span>
            </Link>
            <h1 className="truncate text-[16px] font-semibold lg:hidden">
              {name}
            </h1>
          </div>

          <div className="lg:mt-4 lg:flex lg:items-end lg:justify-between lg:gap-8">
            <div className="mt-6 px-1 lg:mt-0">
              <h1 className="mb-4 hidden font-display text-[28px] font-semibold tracking-[-0.01em] lg:block">
                {name}
              </h1>
              <div className="text-[13px] text-white/65">Available balance</div>
              <div className="mt-1.5 text-[36px] font-semibold leading-none tracking-[-0.02em] tabular lg:text-[44px]">
                {money(Number(account.balance))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/60">
                <span className="font-mono">
                  {maskNumber(account.accountNumber)}
                </span>
                {pendingIn > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-turquoise">
                      <span className="font-mono tabular">
                        +{money(pendingIn)}
                      </span>{" "}
                      pending
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 lg:mt-0 lg:flex lg:shrink-0">
              {actions.map((a) => (
                <Link
                  key={a.name}
                  href={a.href}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-white/10 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15 active:scale-[0.98] lg:px-5"
                >
                  <a.icon className="h-4 w-4" />
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={APP_CONTAINER}>
        {/* ── Segmented control (mobile only) ─────────────────────────── */}
        <div
          role="tablist"
          aria-label="Account view"
          className="mx-4 mt-4 grid grid-cols-2 rounded-full bg-forest/[0.07] p-1 lg:hidden"
        >
          {(["activity", "details"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full py-2 text-[13px] font-semibold capitalize transition",
                tab === t
                  ? "bg-white text-forest shadow-[0_1px_3px_rgba(10,28,28,0.12)]"
                  : "text-forest/65 hover:text-forest",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className={cn(tab !== "activity" && "hidden lg:block")}>
            <h2 className="mt-8 hidden text-[15px] font-semibold text-forest lg:block">
              Activity
            </h2>
            <ActivityList pending={pending} posted={posted} />
          </div>
          <div
            className={cn(
              "lg:sticky lg:top-4",
              tab !== "details" && "hidden lg:block",
            )}
          >
            <h2 className="mt-8 hidden text-[15px] font-semibold text-forest lg:block">
              Account details
            </h2>
            <DetailsList account={account} />
            <AccountManage account={account} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activity ───────────────────────────────────────────────────────────────

function ActivityList({
  pending,
  posted,
}: {
  pending: AppTx[];
  posted: AppTx[];
}) {
  const groups = useMemo(() => {
    const out: { label: string; items: AppTx[] }[] = [];
    for (const tx of posted) {
      const label = dayLabel(tx.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(tx);
      else out.push({ label, items: [tx] });
    }
    return out;
  }, [posted]);

  if (pending.length === 0 && posted.length === 0) {
    return (
      <div className="mx-4 mt-4 rounded-[18px] bg-white px-4 py-10 text-center lg:mx-0 lg:mt-3">
        <p className="text-[14px] font-semibold text-forest">No activity yet</p>
        <p className="mt-1 text-[13px] text-forest/65">
          Deposits, transfers and payments will show up here.
        </p>
      </div>
    );
  }

  return (
    <>
      {pending.length > 0 && <Group label="Pending" items={pending} showDate />}
      {groups.map((g) => (
        <Group key={g.label} label={g.label} items={g.items} />
      ))}
    </>
  );
}

function Group({
  label,
  items,
  showDate = false,
}: {
  label: string;
  items: AppTx[];
  showDate?: boolean;
}) {
  return (
    <section className="mt-5 lg:mt-3 lg:[&+section]:mt-5">
      <h2 className="eyebrow mx-5 mb-2 text-[10px] text-forest/65 lg:mx-1">
        {label}
      </h2>
      <div className="mx-4 lg:mx-0 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
        {items.map((tx) => (
          <ActivityRow key={tx.id} tx={tx} showDate={showDate} />
        ))}
      </div>
    </section>
  );
}

// ─── Details ────────────────────────────────────────────────────────────────

function DetailsList({
  account,
}: {
  account: {
    accountType: string;
    accountNumber: string;
    currency: string;
    status: string;
    isPrimary: boolean;
    createdAt?: string;
  };
}) {
  const [reveal, setReveal] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      toast.success("Account number copied");
    } catch {
      toast.error("Couldn't copy — select it manually instead");
    }
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Account number",
      value: (
        <span className="flex items-center gap-1">
          <span className="font-mono tabular">
            {reveal ? account.accountNumber : maskNumber(account.accountNumber)}
          </span>
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide account number" : "Show account number"}
            className="rounded-full p-1.5 text-forest/65 transition hover:bg-forest/[0.06] hover:text-forest"
          >
            {reveal ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy account number"
            className="rounded-full p-1.5 text-forest/65 transition hover:bg-forest/[0.06] hover:text-forest"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </span>
      ),
    },
    { label: "Currency", value: account.currency },
    {
      label: "Status",
      value: (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[12px] font-semibold",
            account.status === "active"
              ? "bg-turquoise-50 text-turquoise-700"
              : "bg-cat-blue/10 text-cat-blue-700",
          )}
        >
          {statusLabel(account.status)}
        </span>
      ),
    },
    { label: "Primary account", value: account.isPrimary ? "Yes" : "No" },
    {
      label: "Opened",
      value: account.createdAt
        ? new Date(account.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <dl className="mx-4 mt-5 lg:mx-0 lg:mt-3 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex min-h-[52px] items-center justify-between gap-4 border-b border-forest/[0.06] px-4 py-3 last:border-b-0"
        >
          <dt className="text-[13px] text-forest/65">{r.label}</dt>
          <dd className="text-right text-[14px] font-medium text-forest">
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
