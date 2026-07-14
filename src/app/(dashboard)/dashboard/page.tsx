"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  MoreHorizontal,
  Play,
  Plus,
  Repeat,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";
import { useSelectedAccount } from "@/components/account/use-accounts";
import { withAccountParam } from "@/components/account/with-account-param";
import { useSearchParams } from "next/navigation";
import {
  DEMO_MODE,
  DEMO_BALANCE,
  DEMO_CUSTOMER,
  DEMO_SESSION,
  DEMO_TRANSACTIONS,
  DEMO_ACCOUNTS,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK = [
  { name: "Send", href: "/send", icon: Send },
  { name: "Deposit", href: "/deposit", icon: Plus },
  { name: "Withdraw", href: "/transfer-out", icon: ArrowUpFromLine },
  { name: "Exchange", href: "/transactions", icon: Repeat },
] as const;

const FEED = [
  {
    id: 1,
    name: "Salary — Acme Co.",
    when: "Today · 09:14",
    status: "Deposit · USDC",
    amount: 3500,
    strip: "#10b981",
    Icon: Briefcase,
  },
  {
    id: 2,
    name: "Tesco Express",
    when: "Today · 18:02",
    status: "Card · Base",
    amount: -34.5,
    strip: "#ff9500",
    Icon: ShoppingBag,
  },
  {
    id: 3,
    name: "Uber",
    when: "Yesterday",
    status: "Card · Base",
    amount: -12.8,
    strip: "#2f80ed",
    Icon: Car,
  },
  {
    id: 4,
    name: "Netflix",
    when: "Yesterday",
    status: "Subscription",
    amount: -15.99,
    strip: "#ff3b30",
    Icon: Play,
  },
  {
    id: 5,
    name: "Blue Bottle Coffee",
    when: "2d ago",
    status: "Card · Base",
    amount: -6.4,
    strip: "#ff9500",
    Icon: Coffee,
  },
] as const;

function fmtMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [shown, setShown] = useState(true);
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const searchParams = useSearchParams();
  const { account: scopedAccount, mode, openAccounts } = useSelectedAccount();
  const isAggregate = mode === "all";

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE
    ? DEMO_CUSTOMER
    : customerRes?.data || customerRes;

  const { data: balanceRes } = useQuery({
    queryKey: ["wallets", "balances"],
    queryFn: () => fetch("/api/wallets/balances").then((r) => r.json()),
    enabled: !DEMO_MODE && customer?.kycStatus === "active",
  });

  const { data: txRes } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const allTxs = DEMO_MODE
    ? DEMO_TRANSACTIONS
    : txRes?.data?.data || txRes?.data || [];

  // Scope transactions to the selected account when one is chosen.
  const txs = isAggregate
    ? allTxs
    : allTxs.filter(
        (tx: { accountId?: string }) =>
          tx.accountId === scopedAccount?.id
      );

  // Aggregate balance vs. per-account balance.
  const aggregateBalance = parseFloat(
    DEMO_MODE ? DEMO_BALANCE.totalUsd : balanceRes?.data?.totalUsd || "0"
  );
  const totalBalance = isAggregate
    ? aggregateBalance
    : Number(scopedAccount?.balance ?? 0);

  const { monthIn, monthOut } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    let mi = 0;
    let mo = 0;
    for (const tx of txs) {
      if (tx.status !== "completed" || new Date(tx.createdAt) < start)
        continue;
      const a = parseFloat(tx.sourceAmount || "0");
      if (tx.txType === "onramp") mi += a;
      else mo += a;
    }
    return { monthIn: mi, monthOut: mo };
  }, [txs]);

  const demoSession = DEMO_MODE ? DEMO_SESSION : session;
  const firstName = demoSession?.user?.name?.split(" ")[0] || "there";

  const dollars = Math.floor(totalBalance).toLocaleString("en-US");
  const cents = (totalBalance % 1).toFixed(2).slice(2);

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting row */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="eyebrow text-foreground/45">{getGreeting()}</div>
          <h1 className="mt-1.5 text-[36px] font-semibold leading-none tracking-[-0.01em]">
            {firstName}
          </h1>
        </div>
        <div
          className="hidden items-center gap-2 rounded-full bg-turquoise-50 px-3 py-1.5 text-turquoise-700 sm:flex"
          style={{ border: "1px solid rgba(74,194,128,0.25)" }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="text-[12px] font-medium">
            Bank-grade · FDIC pass-through
          </span>
        </div>
      </div>

      {/* Hero row: 64% / 36% */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.78fr)_minmax(0,1fr)]">
        {/* Hero balance */}
        <div className="moneta-hero-bg with-halo relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-card p-7 text-white">
          <button
            onClick={() => setShown((s) => !s)}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition hover:bg-white/15"
            aria-label={shown ? "Hide balance" : "Show balance"}
          >
            {shown ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

          <div className="relative">
            <div className="eyebrow text-white/55">
              {isAggregate
                ? "Total balance"
                : `${scopedAccount?.nickname || scopedAccount?.accountType || "Account"} balance`}
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <div className="tabular text-[48px] font-semibold leading-none tracking-[0.005em] text-white">
                {shown ? (
                  <>
                    <span>$</span>
                    <span className="ml-[0.04em]">{dollars}</span>
                    <span className="ml-[0.08em] text-white/45">
                      .{cents || "00"}
                    </span>
                  </>
                ) : (
                  <>$••••••</>
                )}
              </div>
              <div className="pb-1 text-[12px] font-medium uppercase tracking-[0.16em] text-white/55">
                USD
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <div
                className="tabular flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
                style={{
                  background: "rgba(74,194,128,0.18)",
                  border: "1px solid rgba(74,194,128,0.30)",
                  color: "#7BD2A1",
                }}
              >
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
                +${fmtMoney(monthIn || 3500)} this month
              </div>
              <div className="tabular flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/85 backdrop-blur-md">
                <ArrowDownRight className="h-3 w-3" strokeWidth={2.2} />
                ${fmtMoney(monthOut || 1420)} out
              </div>
            </div>
          </div>

          {/* Currency strip */}
          <div className="relative mt-7 grid grid-cols-3 gap-2">
            <CurrencyChip
              code="USDC"
              amount={shown ? fmtMoney(totalBalance) : "•••"}
              highlight
            />
            <CurrencyChip
              code="USD"
              amount={shown ? "0.00" : "•••"}
            />
            <CurrencyChip code="EUR" amount="—" soon />
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex min-h-[280px] flex-col gap-5 rounded-card border border-foreground/[0.08] bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="eyebrow text-foreground/50">Quick actions</div>
            <button className="text-foreground/40 transition hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((a) => (
              <Link
                key={a.name}
                href={withAccountParam(a.href, searchParams)}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-turquoise text-white transition group-hover:bg-turquoise-600 group-active:bg-turquoise-700"
                  style={{
                    boxShadow:
                      "0 4px 14px -4px rgba(74,194,128,0.55)",
                  }}
                >
                  <a.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="text-[12px] font-medium text-foreground/70 group-hover:text-foreground">
                  {a.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="insights-dashed mt-auto flex items-center gap-3 rounded-[12px] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-turquoise/15 text-turquoise-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight">
                Insights for {new Date().toLocaleString("en-US", { month: "long" })}
              </div>
              <div className="mt-0.5 text-[12px] text-foreground/55">
                Spending {monthOut > monthIn ? "up" : "down"} vs last month
              </div>
            </div>
            <Link
              href="/insights"
              className="whitespace-nowrap rounded-full border border-foreground/15 px-3.5 py-1.5 text-[12px] font-medium transition hover:border-foreground/30 hover:bg-muted"
            >
              View insights
            </Link>
          </div>
        </div>
      </div>

      {/* Chart + card row: 62% / 38% */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.63fr)_minmax(0,1fr)]">
        <BalanceTrend totalBalance={totalBalance} range={range} setRange={setRange} />
        <CardWidget cardholder={(demoSession?.user?.name || "ALEX MORGAN").toUpperCase()} />
      </div>

      {/* Recent activity */}
      <RecentActivity
        txs={txs}
        accounts={openAccounts}
        showAccountChip={isAggregate}
        searchParams={searchParams}
      />
    </div>
  );
}

// ─── Recent activity ────────────────────────────────────────────────────────

type Tx = {
  id: string | number;
  accountId?: string;
  txType?: string;
  status?: string;
  sourceAmount?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  createdAt?: string;
};

function RecentActivity({
  txs,
  accounts,
  showAccountChip,
  searchParams,
}: {
  txs: Tx[];
  accounts: { id: string; nickname: string | null; accountType: string }[];
  showAccountChip: boolean;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  // If we have real transactions, render them. Otherwise fall back to the
  // decorative demo FEED (e.g. fresh accounts with no history yet).
  const hasReal = Array.isArray(txs) && txs.length > 0;
  const top = hasReal
    ? [...txs]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 5)
    : [];

  const accountLabel = (id: string | undefined) => {
    if (!id) return null;
    const a = accounts.find((x) => x.id === id);
    return a?.nickname || a?.accountType || null;
  };

  return (
    <div className="overflow-hidden rounded-card border border-foreground/[0.08] bg-card">
      <div className="flex items-center justify-between px-5 pb-3.5 pt-5">
        <div>
          <div className="text-[16px] font-semibold tracking-[-0.005em]">
            Recent activity
          </div>
          <div className="mt-0.5 text-[12px] text-foreground/50">
            {hasReal
              ? `${Math.min(5, txs.length)} of ${txs.length} this month`
              : `${FEED.length} of ${FEED.length} this month`}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-foreground/65 transition hover:bg-foreground/[0.05]">
            <Filter className="h-3 w-3" />
            Filter
          </button>
          <Link
            href={withAccountParam("/transactions", searchParams)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition hover:bg-foreground/[0.05]"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div>
        {hasReal
          ? top.map((tx) => (
              <RealTxRow
                key={String(tx.id)}
                tx={tx}
                accountLabel={
                  showAccountChip ? accountLabel(tx.accountId) : null
                }
              />
            ))
          : FEED.map((tx) => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}

function RealTxRow({
  tx,
  accountLabel,
}: {
  tx: Tx;
  accountLabel: string | null;
}) {
  const amt = parseFloat(tx.sourceAmount || "0");
  const meta = txMeta(tx.txType ?? "");
  const isIncome = meta.direction === "in";
  const Icon = meta.icon;
  return (
    <div
      className="tx-row grid items-center gap-4 border-b border-foreground/[0.06] px-5 py-4 last:border-b-0"
      style={{ gridTemplateColumns: "3px 40px minmax(0,1fr) auto" }}
    >
      <div
        className="h-7 w-[3px] self-center rounded-sm"
        style={{ background: meta.strip }}
      />
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${meta.strip}1f`, color: meta.strip }}
      >
        <Icon className="h-[17px] w-[17px]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold leading-tight">
            {meta.label}
          </span>
          {accountLabel && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium text-foreground/70">
              {accountLabel}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-foreground/50">
          {fmtTxWhen(tx.createdAt)} · {tx.sourceAsset || "USD"}
          {tx.status === "pending" ? " · Pending" : ""}
        </div>
      </div>
      <div
        className={cn(
          "tabular text-[15px] font-semibold",
          isIncome ? "text-turquoise-700" : "text-foreground"
        )}
      >
        {isIncome ? "+" : "−"}${fmtMoney(Math.abs(amt))}
      </div>
    </div>
  );
}

// Canonical transaction palette — kept in lockstep with the txMeta map in
// transactions/page.tsx so a given type reads the same color + directional
// icon everywhere in the app.
function txMeta(t: string) {
  switch (t) {
    case "onramp":
      return { label: "Deposit", direction: "in" as const, icon: ArrowDownToLine, strip: "#3fb073" };
    case "offramp":
      return { label: "Withdrawal", direction: "out" as const, icon: ArrowUpFromLine, strip: "#2f80ed" };
    case "send":
      return { label: "Sent", direction: "out" as const, icon: Send, strip: "#8b5cf6" };
    case "internal_in":
      return { label: "Move in", direction: "in" as const, icon: Repeat, strip: "#3fb073" };
    case "internal_out":
      return { label: "Move out", direction: "out" as const, icon: Repeat, strip: "#8b5cf6" };
    default:
      return { label: "Transaction", direction: "out" as const, icon: ArrowUpFromLine, strip: "#94a3b8" };
  }
}

function fmtTxWhen(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CurrencyChip({
  code,
  amount,
  highlight,
  soon,
}: {
  code: string;
  amount: string;
  highlight?: boolean;
  soon?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between rounded-[12px] px-3.5 py-3",
        highlight
          ? "border border-turquoise/40 bg-turquoise/15"
          : "border border-white/10 bg-white/[0.06]"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold tracking-wide",
            highlight ? "bg-turquoise text-forest-900" : "bg-white/10 text-white/85"
          )}
        >
          {code === "EUR" ? "€" : "$"}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/55">
            {code}
          </div>
          <div className="tabular truncate text-[13px] font-semibold text-white">
            {amount}
          </div>
        </div>
      </div>
      {soon && (
        <span className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">
          Soon
        </span>
      )}
    </div>
  );
}

function BalanceTrend({
  totalBalance,
  range,
  setRange,
}: {
  totalBalance: number;
  range: "7D" | "30D" | "90D" | "1Y";
  setRange: (r: "7D" | "30D" | "90D" | "1Y") => void;
}) {
  // 30 days of demo data — gentle climb with realistic noise
  const data = useMemo(
    () => [
      9020, 8980, 9120, 9300, 9180, 9420, 9510, 9480, 9710, 9990,
      10120, 10080, 10310, 10520, 10470, 10690, 10880, 11020, 11150, 11240,
      11380, 11220, 11470, 11680, 11820, 11900, 12050, 12180, 12340,
      Math.max(12458, Math.round(totalBalance)),
    ],
    [totalBalance]
  );
  const W = 680;
  const H = 220;
  const PAD_X = 8;
  const PAD_Y = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range_ = max - min || 1;
  const step = (W - PAD_X * 2) / (data.length - 1);
  const points = data.map(
    (v, i) =>
      [PAD_X + i * step, PAD_Y + (1 - (v - min) / range_) * (H - PAD_Y * 2)] as [
        number,
        number,
      ]
  );

  const linePath = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
  const fillPath =
    linePath +
    ` L${points[points.length - 1][0]},${H - PAD_Y} L${points[0][0]},${H - PAD_Y} Z`;
  const [lx, ly] = points[points.length - 1];

  const xLabels = [
    { x: PAD_X, text: "Mar 30", anchor: "start" as const },
    { x: PAD_X + step * 9, text: "Apr 8", anchor: "middle" as const },
    { x: PAD_X + step * 19, text: "Apr 18", anchor: "middle" as const },
    { x: W - PAD_X, text: "Today", anchor: "end" as const },
  ];

  const ranges = ["7D", "30D", "90D", "1Y"] as const;

  return (
    <div className="flex flex-col rounded-card border border-foreground/[0.08] bg-card p-6">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <div className="eyebrow text-foreground/50">
            Balance · last 30 days
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="tabular text-[24px] font-semibold tracking-[0.005em]">
              ${fmtMoney(data[data.length - 1])}
            </div>
            <div className="tabular flex items-center gap-1 text-[13px] font-medium text-turquoise-700">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.2} />
              +{(((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1)}% · +$
              {fmtMoney(data[data.length - 1] - data[0])}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-foreground/[0.06] bg-muted p-1 text-[12px] font-medium">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-3 py-1 transition",
                r === range
                  ? "bg-card text-foreground shadow-card"
                  : "text-foreground/55 hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 mt-4">
        <svg
          viewBox={`0 0 ${W} ${H + 24}`}
          className="h-[230px] w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4AC280" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#4AC280" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#4AC280" stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#trendFill)" />
          <path
            d={linePath}
            stroke="#4AC280"
            strokeWidth="2.25"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="0"
            y1={H - PAD_Y + 0.5}
            x2={W}
            y2={H - PAD_Y + 0.5}
            stroke="rgba(18,46,46,0.08)"
            strokeWidth="1"
          />
          <circle cx={lx} cy={ly} r="9" fill="rgba(74,194,128,0.18)" />
          <circle
            cx={lx}
            cy={ly}
            r="4.5"
            fill="#4AC280"
            stroke="#fff"
            strokeWidth="2"
          />
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={H + 14}
              fontSize="11"
              fill="rgba(18,46,46,0.48)"
              textAnchor={l.anchor}
              fontFamily="Geist, system-ui"
            >
              {l.text}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function CardWidget({ cardholder }: { cardholder: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-foreground/[0.08] bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="eyebrow text-foreground/50">Your card</div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-turquoise-700">
          <span className="h-1.5 w-1.5 rounded-full bg-turquoise" />
          Active
        </div>
      </div>

      <MonetaCard
        size="sm"
        holder={cardholder}
        card={{
          last4: "7891",
          cardType: "virtual",
          status: "active",
          expMonth: 8,
          expYear: 2029,
          network: "visa",
        }}
      />

      <div className="flex gap-2">
        <Link
          href="/card"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-foreground/[0.08] bg-foreground/[0.05] px-4 py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/[0.08]"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Manage
        </Link>
        <Link
          href="/card"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-turquoise px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-turquoise-600"
          style={{ boxShadow: "0 6px 16px -6px rgba(74,194,128,0.55)" }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          Virtual
        </Link>
      </div>
    </div>
  );
}

function TxRow({ tx }: { tx: (typeof FEED)[number] }) {
  const isIncome = tx.amount > 0;
  const Icon = tx.Icon;
  return (
    <div
      className="tx-row grid cursor-pointer items-center gap-4 border-b border-foreground/[0.06] px-5 py-4 transition-colors last:border-b-0"
      style={{ gridTemplateColumns: "3px 40px minmax(0,1fr) auto" }}
    >
      <div
        className="h-7 w-[3px] self-center rounded-sm"
        style={{ background: tx.strip }}
      />
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${tx.strip}1f`, color: tx.strip }}
      >
        <Icon className="h-[17px] w-[17px]" />
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-tight">{tx.name}</div>
        <div className="mt-0.5 text-[12px] text-foreground/50">
          {tx.when} · {tx.status}
        </div>
      </div>
      <div
        className={cn(
          "tabular text-[15px] font-semibold",
          isIncome ? "text-turquoise-700" : "text-foreground"
        )}
      >
        {isIncome ? "+" : "−"}${fmtMoney(Math.abs(tx.amount))}
      </div>
    </div>
  );
}
