// Dashboard.jsx — Moneta /dashboard
// Desktop-first @ 1280px. Tailwind utility classes + Lucide icons.

const { useEffect, useRef, useState } = React;

/* ---------------------------------------------------------------------------
   Icon — Lucide UMD wrapper (renders an inline SVG by name)
--------------------------------------------------------------------------- */
function Icon({ name, size = 18, strokeWidth = 1.75, className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    const icons = window.lucide.icons || {};
    // lucide stores PascalCase keys; convert kebab → Pascal
    const pascal = name.split("-").map(p => p[0].toUpperCase() + p.slice(1)).join("");
    const def = icons[pascal] || icons[name];
    if (!def) { ref.current.innerHTML = ""; return; }
    // def is [tag, attrs, children]
    const [, attrs, children] = def;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    Object.entries({ ...attrs, width: size, height: size, "stroke-width": strokeWidth }).forEach(([k,v]) => svg.setAttribute(k, v));
    (children || []).forEach(([t, a]) => {
      const el = document.createElementNS(ns, t);
      Object.entries(a).forEach(([k,v]) => el.setAttribute(k, v));
      svg.appendChild(el);
    });
    ref.current.innerHTML = "";
    ref.current.appendChild(svg);
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={"inline-flex items-center justify-center " + className} style={style} aria-hidden="true" />;
}

/* ---------------------------------------------------------------------------
   Sidebar — 256px Deep Forest, grouped nav, turquoise active pill
--------------------------------------------------------------------------- */
const NAV_GROUPS = [
  { label: "Overview", items: [{ name: "Dashboard", icon: "layout-dashboard" }] },
  { label: "Money",    items: [
    { name: "Top Up",       icon: "arrow-down-to-line" },
    { name: "Transfer Out", icon: "arrow-up-from-line" },
    { name: "Send",         icon: "send" },
  ]},
  { label: "Products", items: [
    { name: "Card",  icon: "credit-card" },
    { name: "Loans", icon: "landmark" },
  ]},
  { label: "Activity", items: [
    { name: "Transactions", icon: "arrow-up-down" },
    { name: "Recipients",   icon: "users" },
    { name: "Insights",     icon: "trending-up" },
  ]},
  { label: "Account",  items: [{ name: "Settings", icon: "settings" }] },
];

function Sidebar({ active }) {
  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 bg-forest-900 text-white flex flex-col"
           style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
        <img src="assets/logo-mark-white.svg" alt="" className="w-7 h-7" />
        <span className="text-[20px] font-semibold tracking-[-0.01em]">moneta</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="eyebrow px-3 mb-1 text-white/40 text-[10px]">{group.label}</div>
            {group.items.map(it => {
              const isActive = it.name === active;
              return (
                <button
                  key={it.name}
                  className={
                    "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-left transition-colors " +
                    (isActive
                      ? "nav-active"
                      : "text-white/70 hover:text-white hover:bg-white/5")
                  }
                >
                  <Icon name={it.icon} size={17} />
                  <span>{it.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User chip */}
      <div className="m-3 p-2.5 flex items-center gap-2.5 rounded-[10px] bg-white/[0.04] border border-white/10">
        <div className="w-8 h-8 rounded-full bg-turquoise text-forest-900 flex items-center justify-center text-[12px] font-semibold">AM</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate">Alex Morgan</div>
          <div className="text-[11px] text-white/50 truncate">alex@moneta.app</div>
        </div>
        <button className="text-white/50 hover:text-white"><Icon name="chevron-right" size={16} /></button>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------------------
   Topbar — search, notifications, avatar
--------------------------------------------------------------------------- */
function Topbar() {
  return (
    <div className="h-16 px-8 flex items-center gap-4 bg-marble" style={{ borderBottom: "1px solid rgba(18,46,46,0.06)" }}>
      <label className="relative flex-1 max-w-[460px]">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/40">
          <Icon name="search" size={16} />
        </span>
        <input
          type="text"
          placeholder="Search transactions, recipients…"
          className="w-full h-10 pl-10 pr-4 rounded-full bg-white border border-forest/[0.08] text-[14px] placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent transition"
        />
      </label>
      <div className="flex-1" />
      <button className="w-10 h-10 rounded-full bg-white border border-forest/[0.08] flex items-center justify-center hover:bg-marble transition relative">
        <Icon name="bell" size={18} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cat-red ring-2 ring-white" />
      </button>
      <button className="w-10 h-10 rounded-full bg-forest-700 text-white flex items-center justify-center text-[12px] font-semibold tracking-wide">AM</button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Greeting row
--------------------------------------------------------------------------- */
function GreetingRow() {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <div className="eyebrow text-forest/45">Good morning</div>
        <h1 className="mt-1.5 text-[36px] leading-none font-semibold tracking-[-0.01em]">Alex</h1>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-turquoise-50 text-turquoise-700"
           style={{ border: "1px solid rgba(74,194,128,0.25)" }}>
        <Icon name="shield-check" size={14} />
        <span className="text-[12px] font-medium">Bank-grade · FDIC pass-through</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Hero balance card (left, ~64%)
--------------------------------------------------------------------------- */
function HeroBalance() {
  const [shown, setShown] = useState(true);
  const dollars = "12,458";
  const cents   = "32";
  const masked  = "••••••";

  return (
    <div className="moneta-hero-bg with-halo rounded-card p-7 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]">
      {/* Eye toggle top-right */}
      <button
        onClick={() => setShown(s => !s)}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/8 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/15 transition z-10"
        aria-label={shown ? "Hide balance" : "Show balance"}
      >
        <Icon name={shown ? "eye" : "eye-off"} size={16} />
      </button>

      <div className="relative">
        <div className="eyebrow text-white/55">Total balance</div>
        <div className="flex items-baseline gap-3 mt-3">
          <div className="text-[48px] font-semibold leading-none tracking-[-0.02em] tabular text-white">
            {shown ? <>$<span>{dollars}</span><span className="text-white/45">.{cents}</span></> : <>$<span>{masked}</span></>}
          </div>
          <div className="text-[12px] font-medium text-white/55 tracking-[0.16em] uppercase pb-1">USD</div>
        </div>

        {/* Movement pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium tabular"
               style={{ background: "rgba(74,194,128,0.18)", border: "1px solid rgba(74,194,128,0.30)", color: "#7BD2A1" }}>
            <Icon name="arrow-up-right" size={12} strokeWidth={2.2} />
            +$3,500.00 this month
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium tabular bg-white/8 border border-white/10 text-white/85 backdrop-blur-md">
            <Icon name="arrow-down-right" size={12} strokeWidth={2.2} />
            $1,420.00 out
          </div>
        </div>
      </div>

      {/* Currency strip */}
      <div className="mt-7 grid grid-cols-3 gap-2 relative">
        <CurrencyChip code="USDC" amount="8,250.18" highlight />
        <CurrencyChip code="USD"  amount="4,208.14" />
        <CurrencyChip code="EUR"  amount="—" soon />
      </div>
    </div>
  );
}

function CurrencyChip({ code, amount, highlight, soon }) {
  return (
    <div
      className={
        "rounded-[12px] px-3.5 py-3 flex items-center justify-between min-w-0 " +
        (highlight
          ? "bg-turquoise/15 border border-turquoise/40"
          : "bg-white/[0.06] border border-white/10")
      }
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={
          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold tracking-wide " +
          (highlight ? "bg-turquoise text-forest-900" : "bg-white/10 text-white/85")
        }>{code === "USDC" ? "$" : code === "EUR" ? "€" : "$"}</div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium tracking-wider uppercase text-white/55">{code}</div>
          <div className="text-[13px] font-semibold tabular text-white truncate">{amount}</div>
        </div>
      </div>
      {soon && (
        <span className="text-[9px] font-semibold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-white/60">Soon</span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Quick actions card (right, ~36%)
--------------------------------------------------------------------------- */
const QUICK = [
  { name: "Send",     icon: "send" },
  { name: "Top Up",   icon: "plus" },
  { name: "Withdraw", icon: "arrow-up-from-line" },
  { name: "Exchange", icon: "repeat" },
];
function QuickActionsCard() {
  return (
    <div className="bg-white rounded-card border border-forest/[0.08] p-6 flex flex-col gap-5 min-h-[280px]">
      <div className="flex items-center justify-between">
        <div className="eyebrow text-forest/50">Quick actions</div>
        <button className="text-forest/40 hover:text-forest transition"><Icon name="more-horizontal" size={16} /></button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK.map(a => (
          <button key={a.name} className="flex flex-col items-center gap-2 group">
            <span className="w-11 h-11 rounded-full bg-turquoise text-white flex items-center justify-center transition shadow-[0_4px_14px_-4px_rgba(74,194,128,0.55)] group-hover:bg-turquoise-600 group-active:bg-turquoise-700">
              <Icon name={a.icon} size={18} strokeWidth={2} />
            </span>
            <span className="text-[12px] font-medium text-forest/70 group-hover:text-forest">{a.name}</span>
          </button>
        ))}
      </div>

      {/* Insights soft dashed panel */}
      <div className="insights-dashed rounded-[12px] p-4 mt-auto flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-turquoise/12 text-turquoise-700 flex items-center justify-center flex-shrink-0">
          <Icon name="sparkles" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight">Insights for April</div>
          <div className="text-[12px] text-forest/55 mt-0.5">Spending down 12% vs March</div>
        </div>
        <button className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border border-forest/16 hover:border-forest/30 hover:bg-marble transition whitespace-nowrap">
          View insights
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Balance trend area chart (left col, ~62%)
--------------------------------------------------------------------------- */
function BalanceTrend() {
  // 30 days of demo data — gentle climb with realistic noise
  const data = [
    9020, 8980, 9120, 9300, 9180, 9420, 9510, 9480, 9710, 9990,
    10120, 10080, 10310, 10520, 10470, 10690, 10880, 11020, 11150, 11240,
    11380, 11220, 11470, 11680, 11820, 11900, 12050, 12180, 12340, 12458,
  ];
  const W = 680, H = 220, PAD_X = 8, PAD_Y = 18;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = (W - PAD_X * 2) / (data.length - 1);
  const points = data.map((v, i) => [PAD_X + i * step, PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2)]);

  // Smooth path (catmull-rom-ish via simple bezier)
  const linePath = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
  const fillPath = linePath + ` L${points[points.length - 1][0]},${H - PAD_Y} L${points[0][0]},${H - PAD_Y} Z`;

  // Last point dot
  const [lx, ly] = points[points.length - 1];

  // X-axis labels
  const xLabels = [
    { x: PAD_X,             text: "Mar 30" },
    { x: PAD_X + step * 9,  text: "Apr 8"  },
    { x: PAD_X + step * 19, text: "Apr 18" },
    { x: W - PAD_X,         text: "Today"  },
  ];

  return (
    <div className="bg-white rounded-card border border-forest/[0.08] p-6 flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="eyebrow text-forest/50">Balance · last 30 days</div>
          <div className="flex items-baseline gap-3 mt-2">
            <div className="text-[24px] font-semibold tracking-[-0.01em] tabular">$12,458.32</div>
            <div className="flex items-center gap-1 text-[13px] font-medium text-turquoise-700 tabular">
              <Icon name="trending-up" size={14} strokeWidth={2.2} />
              +38.1% · +$3,438
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-marble border border-forest/[0.06] text-[12px] font-medium">
          {["7D", "30D", "90D", "1Y"].map((r, i) => (
            <button key={r} className={
              "px-3 py-1 rounded-full transition " +
              (i === 1 ? "bg-white text-forest shadow-card" : "text-forest/55 hover:text-forest")
            }>{r}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 -mx-2">
        <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-[230px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4AC280" stopOpacity="0.28" />
              <stop offset="60%"  stopColor="#4AC280" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#4AC280" stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#trendFill)" />
          <path d={linePath} stroke="#4AC280" strokeWidth="2.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* x-axis hairline */}
          <line x1="0" y1={H - PAD_Y + 0.5} x2={W} y2={H - PAD_Y + 0.5} stroke="rgba(18,46,46,0.08)" strokeWidth="1" />
          {/* last point dot */}
          <circle cx={lx} cy={ly} r="9" fill="rgba(74,194,128,0.18)" />
          <circle cx={lx} cy={ly} r="4.5" fill="#4AC280" stroke="#fff" strokeWidth="2" />
          {/* x labels */}
          {xLabels.map((l, i) => (
            <text key={i} x={l.x} y={H + 14} fontSize="11" fill="rgba(18,46,46,0.48)"
                  textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
                  fontFamily="Geist, system-ui">{l.text}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Virtual card preview widget (right col, ~38%)
--------------------------------------------------------------------------- */
function CardWidget() {
  return (
    <div className="bg-white rounded-card border border-forest/[0.08] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="eyebrow text-forest/50">Your card</div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-turquoise-700">
          <span className="w-1.5 h-1.5 rounded-full bg-turquoise" />
          Active
        </div>
      </div>

      {/* Card */}
      <div className="moneta-hero-bg with-halo rounded-xl2 p-5 text-white relative overflow-hidden"
           style={{ aspectRatio: "1.586 / 1" }}>
        <div className="flex items-start justify-between relative">
          {/* EMV chip */}
          <div className="w-[42px] h-[32px] rounded-[5px] relative"
               style={{
                 background: "linear-gradient(135deg, #E8C77A 0%, #C9A45A 50%, #9A7A3F 100%)",
                 boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
               }}>
            <div className="absolute left-1 right-1 top-[10px] h-px bg-black/20" />
            <div className="absolute left-1 right-1 top-[21px] h-px bg-black/20" />
            <div className="absolute top-1 bottom-1 left-[15px] w-px bg-black/20" />
          </div>
          <img src="assets/logo-lockup-white.svg" alt="moneta" className="h-5 relative" />
        </div>

        <div className="absolute left-5 right-5 bottom-5 flex flex-col gap-3">
          <div className="font-mono text-[15px] tracking-[0.20em] tabular text-white/95 font-medium relative">
            •••• &nbsp; •••• &nbsp; •••• &nbsp; 7891
          </div>
          <div className="flex items-end justify-between relative">
            <div>
              <div className="eyebrow text-white/50 text-[9px]">Cardholder</div>
              <div className="text-[12px] font-medium mt-0.5 tracking-wide">ALEX MORGAN</div>
            </div>
            <div>
              <div className="eyebrow text-white/50 text-[9px]">Exp</div>
              <div className="text-[12px] font-medium mt-0.5 font-mono">08/29</div>
            </div>
            {/* VISA */}
            <div className="text-[15px] font-bold italic tracking-tight" style={{ fontFamily: "Geist, sans-serif", letterSpacing: "0.04em" }}>VISA</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2.5 rounded-full text-[13px] font-medium bg-forest/[0.05] border border-forest/[0.08] text-forest hover:bg-forest/[0.08] transition flex items-center justify-center gap-1.5">
          <Icon name="settings-2" size={14} />
          Manage
        </button>
        <button className="flex-1 px-4 py-2.5 rounded-full text-[13px] font-medium bg-turquoise text-white hover:bg-turquoise-600 transition flex items-center justify-center gap-1.5 shadow-[0_6px_16px_-6px_rgba(74,194,128,0.55)]">
          <Icon name="plus" size={14} strokeWidth={2.4} />
          Virtual
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Recent activity (full-width)
--------------------------------------------------------------------------- */
const TXNS = [
  { id: 1, name: "Salary — Acme Co.",   when: "Today · 09:14",   status: "Deposit · USDC",  amount:  3500.00, strip: "#10B981", icon: "briefcase",   sub: "Acme Co." },
  { id: 2, name: "Tesco Express",       when: "Today · 18:02",   status: "Card · Base",     amount: -34.50,   strip: "#FF9500", icon: "shopping-bag" },
  { id: 3, name: "Uber",                when: "Yesterday",       status: "Card · Base",     amount: -12.80,   strip: "#2F80ED", icon: "car" },
  { id: 4, name: "Netflix",             when: "Yesterday",       status: "Subscription",    amount: -15.99,   strip: "#FF3B30", icon: "play" },
  { id: 5, name: "Blue Bottle Coffee",  when: "2d ago",          status: "Card · Base",     amount: -6.40,    strip: "#FF9500", icon: "coffee" },
];

function TxRow({ tx }) {
  const isIncome = tx.amount > 0;
  return (
    <div className="tx-row grid items-center gap-4 px-5 py-4 border-b border-forest/[0.06] last:border-b-0 cursor-pointer transition-colors"
         style={{ gridTemplateColumns: "3px 40px 1fr auto" }}>
      <div className="w-[3px] h-7 rounded-sm self-center" style={{ background: tx.strip }} />
      <div className="w-10 h-10 rounded-full bg-forest/[0.06] text-forest/65 flex items-center justify-center">
        <Icon name={tx.icon} size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-tight">{tx.name}</div>
        <div className="text-[12px] text-forest/50 mt-0.5">{tx.when} · {tx.status}</div>
      </div>
      <div className={"text-[15px] font-semibold tabular " + (isIncome ? "text-turquoise-700" : "text-forest")}>
        {isIncome ? "+" : "−"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-card border border-forest/[0.08] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3.5">
        <div>
          <div className="text-[16px] font-semibold tracking-[-0.005em]">Recent activity</div>
          <div className="text-[12px] text-forest/50 mt-0.5">5 of 132 this month</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="px-3 py-1.5 rounded-full text-[12px] font-medium text-forest/65 hover:bg-forest/[0.05] transition flex items-center gap-1.5">
            <Icon name="filter" size={13} />
            Filter
          </button>
          <button className="px-3 py-1.5 rounded-full text-[12px] font-medium text-forest hover:bg-forest/[0.05] transition flex items-center gap-1">
            View all <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </div>
      <div>
        {TXNS.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Composition
--------------------------------------------------------------------------- */
function Dashboard() {
  return (
    <div className="flex min-h-screen bg-marble" data-screen-label="Dashboard">
      <Sidebar active="Dashboard" />
      <main className="flex-1 min-w-0">
        <Topbar />
        <div className="px-8 py-7" >
          <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
            <GreetingRow />

            {/* Hero row: 64% / 36% */}
            <div className="grid gap-5" style={{ gridTemplateColumns: "1.78fr 1fr" }}>
              <HeroBalance />
              <QuickActionsCard />
            </div>

            {/* Chart + card row: 62% / 38% */}
            <div className="grid gap-5" style={{ gridTemplateColumns: "1.63fr 1fr" }}>
              <BalanceTrend />
              <CardWidget />
            </div>

            <RecentActivity />

            <div className="h-4" />
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
