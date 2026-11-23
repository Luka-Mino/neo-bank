"use client";

// Settings — /app version of (dashboard)/settings.
// Same APIs: PATCH /api/users/profile, GET/POST /api/auth/2fa[/setup|/verify|
// /disable|/backup-codes], GET/POST/DELETE /api/auth/email-otp (new here:
// the old screen had no way to turn on email codes), GET/PATCH
// /api/users/preferences, PATCH /api/users/password.

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { AppSheet } from "@/components/app/sheet";
import { TextField } from "@/components/app/fields";
import { Notice } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { useCustomer } from "@/components/app/data";
import { Button, ButtonLink } from "@/components/brand/button";
import { IconDisc, type IconName } from "@/components/brand/icon";
import { DEMO_MODE, DEMO_SESSION } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {

  return (
    <div className="pb-10 lg:pb-16">
      <header className="bg-forest text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-8")}>
          <Link href="/app/more" className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            More
          </Link>
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Settings</h1>
          <p className="mt-1 text-[14px] text-white/65">Profile, security and notifications.</p>
        </div>
      </header>
      <div className={cn(APP_CONTAINER, "mt-5 space-y-5 px-4 lg:mt-8 lg:grid lg:max-w-[1180px] lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0")}>
        <div className="space-y-5 lg:space-y-6">
          <TwoStepSection />
          <PasswordSection />
        </div>
        <div className="space-y-5 lg:space-y-6">
          <ProfileSection />
          <IdentitySection />
          <NotificationsSection />
        </div>
      </div>
    </div>
  );
}

function Section({ id, icon, title, description, children }: { id?: string; icon: IconName; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[20px] bg-white p-5 shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:p-6">
      <div className="flex items-start gap-3.5">
        <IconDisc name={icon} size={42} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold text-forest">{title}</h2>
          {description && <p className="mt-0.5 text-[13.5px] leading-relaxed text-forest/60">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// ─── Profile ────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: realSession, update } = useSession();
  const session = DEMO_MODE ? DEMO_SESSION : realSession;
  const [name, setName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const current = name ?? session?.user?.name ?? "";
  const dirty = name !== null && name.trim() !== (session?.user?.name ?? "") && name.trim().length >= 2;

  async function save() {
    if (!dirty) return;
    setSaving(true);
    try {
      if (!DEMO_MODE) {
        await postJson("/api/users/profile", { fullName: current.trim() }, { method: "PATCH" });
        await update?.({ name: current.trim() });
      }
      toast.success("Name updated");
      setName(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update your name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section icon="accounts" title="Profile">
      <div className="space-y-4">
        <TextField label="Full name" autoComplete="name" maxLength={70} value={current} onChange={(e) => setName(e.target.value)} />
        <TextField label="Email" value={session?.user?.email ?? ""} readOnly disabled hint="Contact support to change your email address." />
        <Button size="sm" disabled={!dirty} loading={saving} onClick={save}>
          Save name
        </Button>
      </div>
    </Section>
  );
}

// ─── Identity ───────────────────────────────────────────────────────────────

function IdentitySection() {
  const { customer, verified, isLoading } = useCustomer();
  const status = customer?.kycStatus;
  const label = verified ? "Verified" : status === "partner_review" ? "In review" : status === "rejected" ? "Not verified" : "Not started";
  return (
    <Section icon="protection" title="Identity verification" description="Required before money can move.">
      <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f3f5f4] px-4 py-3">
        <span className="text-[14px] text-forest/70">Status</span>
        <span className={cn("text-[14px] font-semibold", verified ? "text-turquoise-700" : "text-forest")}>{isLoading ? "…" : label}</span>
      </div>
      {!verified && !isLoading && (
        <ButtonLink href="/app/onboarding" size="sm" variant="secondary" arrow className="mt-4">
          {status === "partner_review" ? "Check status" : "Verify now"}
        </ButtonLink>
      )}
    </Section>
  );
}

// ─── Two-step sign-in ───────────────────────────────────────────────────────

type TwoFaStatus = { enabled: boolean; backupCodesRemaining: number };
const DEMO_CODES = ["RT2Q8-6M59S", "H7XKP-3WD4N", "9BQY2-VT8FE", "MK5RH-QN7XA", "2WPD6-YB3JC", "X8HN4-KR9MQ", "5VQT7-2DFHB", "P3MW9-XK6RN", "Q7BY2-8HVND", "4RKX6-MP2WT"];

function TwoStepSection() {
  const qc = useQueryClient();
  const [demo, setDemo] = useState<{ totp: boolean; email: boolean }>({ totp: false, email: false });
  const totpQ = useQuery<TwoFaStatus>({
    queryKey: ["2fa-status"],
    queryFn: async () => (await (await fetch("/api/auth/2fa")).json())?.data,
    enabled: !DEMO_MODE,
  });
  const emailQ = useQuery<{ enabled: boolean }>({
    queryKey: ["email-otp-status"],
    queryFn: async () => (await (await fetch("/api/auth/email-otp")).json())?.data,
    enabled: !DEMO_MODE,
  });
  const totpOn = DEMO_MODE ? demo.totp : Boolean(totpQ.data?.enabled);
  const emailOn = DEMO_MODE ? demo.email : Boolean(emailQ.data?.enabled);
  const codesLeft = DEMO_MODE ? (demo.totp ? 10 : 0) : Number(totpQ.data?.backupCodesRemaining ?? 0);
  const loading = !DEMO_MODE && (totpQ.isLoading || emailQ.isLoading);

  type Sheet = null | "enroll" | "codes" | "disable" | "regen" | "email-off";
  const [sheet, setSheet] = useState<Sheet>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["2fa-status"] });
    qc.invalidateQueries({ queryKey: ["email-otp-status"] });
  };
  const open = (s: Sheet) => {
    setCode("");
    setPassword("");
    setError(null);
    setSheet(s);
  };
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const beginEnroll = () =>
    run(async () => {
      let url = "otpauth://totp/Moneta:alex@demo.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Moneta";
      let sec = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
      if (!DEMO_MODE) {
        const r = await postJson<{ otpauthUrl: string; secret: string }>("/api/auth/2fa/setup", {});
        url = r.otpauthUrl;
        sec = r.secret;
      }
      setQr(await QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: "#122e2e", light: "#ffffff" } }));
      setSecret(sec);
      open("enroll");
    });

  const verify = () =>
    run(async () => {
      let backup = DEMO_CODES;
      if (DEMO_MODE) setDemo((d) => ({ ...d, totp: true }));
      else backup = (await postJson<{ backupCodes: string[] }>("/api/auth/2fa/verify", { code })).backupCodes;
      refresh();
      setQr(null);
      setSecret(null);
      setCodes(backup);
      setSheet("codes");
    });

  const disable = () =>
    run(async () => {
      if (DEMO_MODE) setDemo((d) => ({ ...d, totp: false }));
      else await postJson("/api/auth/2fa/disable", { code });
      refresh();
      setSheet(null);
      toast.success("Authenticator app turned off");
    });

  const regen = () =>
    run(async () => {
      const fresh = DEMO_MODE ? DEMO_CODES : (await postJson<{ backupCodes: string[] }>("/api/auth/2fa/backup-codes", { code })).backupCodes;
      refresh();
      setCodes(fresh);
      setSheet("codes");
    });

  const emailOnFn = () =>
    run(async () => {
      if (DEMO_MODE) setDemo((d) => ({ ...d, email: true }));
      else await postJson("/api/auth/email-otp", {});
      refresh();
      toast.success("Email codes turned on");
    });

  const emailOff = () =>
    run(async () => {
      if (DEMO_MODE) setDemo((d) => ({ ...d, email: false }));
      else await postJson("/api/auth/email-otp", { password }, { method: "DELETE" });
      refresh();
      setSheet(null);
      toast.success("Email codes turned off");
    });

  function downloadCodes(list: string[]) {
    const blob = new Blob([`Moneta two-step sign-in backup codes\n\nEach code works once. Keep them somewhere safe.\n\n${list.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moneta-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const status = totpOn ? "Authenticator app" : emailOn ? "Email codes" : "Off";

  return (
    <Section id="security" icon="two-step" title="Two-step sign-in" description="A code as well as your password whenever you sign in. Money can't move until it's on.">
      <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f3f5f4] px-4 py-3">
        <span className="text-[14px] text-forest/70">Status</span>
        <span className={cn("text-[14px] font-semibold", totpOn || emailOn ? "text-turquoise-700" : "text-[#b42f34]")}>{loading ? "…" : status}</span>
      </div>

      {!loading && !totpOn && (
        <div className="mt-4 space-y-3">
          {!emailOn && (
            <Notice tone="warning" title="Turn this on to move money">
              Sending, transferring and withdrawing all need two-step sign-in.
            </Notice>
          )}
          <OptionRow
            title="Authenticator app"
            badge="Recommended"
            body="Use an app like Google Authenticator or 1Password. Works offline and can't be intercepted."
            action={
              <Button size="sm" loading={busy && sheet === null} onClick={beginEnroll}>
                {emailOn ? "Switch" : "Set up"}
              </Button>
            }
          />
          {!emailOn ? (
            <OptionRow
              title="Email codes"
              body="We email you a one-time code each time you sign in."
              action={
                <Button size="sm" variant="secondary" loading={busy && sheet === null} onClick={emailOnFn}>
                  Turn on
                </Button>
              }
            />
          ) : (
            <OptionRow
              title="Email codes are on"
              body="Switching to an authenticator app is more secure."
              action={
                <Button size="sm" variant="quiet" onClick={() => open("email-off")}>
                  Turn off
                </Button>
              }
            />
          )}
          {error && sheet === null && <p className="text-[13px] text-[#b42f34]">{error}</p>}
        </div>
      )}

      {!loading && totpOn && (
        <div className="mt-4 space-y-3">
          <div className="rounded-[14px] px-1 text-[14px] text-forest/75">
            <span className="font-semibold text-forest">{codesLeft} of 10</span> backup codes left.{" "}
            {codesLeft <= 3 ? "You're running low, so make a fresh set." : "Use one if you lose your phone."}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" variant="secondary" onClick={() => open("regen")}>
              New backup codes
            </Button>
            <Button size="sm" variant="danger" onClick={() => open("disable")}>
              Turn off
            </Button>
          </div>
        </div>
      )}

      {/* Enroll: scan, then prove a code */}
      <AppSheet open={sheet === "enroll"} onOpenChange={(o) => !o && setSheet(null)} title="Set up your authenticator app" busy={busy}
        footer={<Button block loading={busy} disabled={!/^\d{6}$/.test(code)} onClick={verify}>Turn on</Button>}>
        <ol className="space-y-4 text-[14px] text-forest/75">
          <li>
            <span className="font-semibold text-forest">1. Scan this code</span> with your authenticator app.
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR code to add Moneta to your authenticator app" width={180} height={180} className="mx-auto mt-3 rounded-[12px] ring-1 ring-forest/10" />
            )}
            {secret && (
              <p className="mt-3 text-center text-[12.5px]">
                Can&apos;t scan? Enter this key:{" "}
                <span className="select-all break-all font-mono font-semibold text-forest">{secret}</span>
              </p>
            )}
          </li>
          <li>
            <span className="font-semibold text-forest">2. Enter the 6-digit code</span> it shows.
            <CodeInput value={code} onChange={setCode} />
          </li>
        </ol>
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>

      {/* Backup codes: shown once */}
      <AppSheet open={sheet === "codes"} onOpenChange={(o) => !o && setSheet(null)} title="Save your backup codes"
        description="Each code works once. If you lose your phone, a code gets you back in. They won't be shown again."
        footer={<Button block onClick={() => setSheet(null)}>I&apos;ve saved them</Button>}>
        {codes && (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-[14px] bg-[#f3f5f4] p-4 font-mono text-[14.5px] font-semibold tracking-wider text-forest">
              {codes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Button size="sm" variant="secondary" onClick={() => downloadCodes(codes)}>Download</Button>
              <Button size="sm" variant="quiet" onClick={() => navigator.clipboard.writeText(codes.join("\n")).then(() => toast.success("Codes copied"), () => toast.error("Couldn't copy"))}>Copy</Button>
            </div>
          </>
        )}
      </AppSheet>

      {/* Code-gated actions */}
      <AppSheet open={sheet === "disable" || sheet === "regen"} onOpenChange={(o) => !o && setSheet(null)} busy={busy}
        title={sheet === "disable" ? "Turn off your authenticator app?" : "Make new backup codes"}
        description={sheet === "disable" ? "You won't be able to move money until two-step sign-in is back on." : "Your old backup codes will stop working."}
        footer={
          <Button block variant={sheet === "disable" ? "danger" : "primary"} loading={busy} disabled={!/^\d{6}$/.test(code)} onClick={sheet === "disable" ? disable : regen}>
            {sheet === "disable" ? "Turn off" : "Make new codes"}
          </Button>
        }>
        <p className="text-[14px] text-forest/70">Enter the current code from your authenticator app.</p>
        <CodeInput value={code} onChange={setCode} />
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>

      <AppSheet open={sheet === "email-off"} onOpenChange={(o) => !o && setSheet(null)} busy={busy} title="Turn off email codes?"
        description="You won't be able to move money until two-step sign-in is back on."
        footer={<Button block variant="danger" loading={busy} disabled={!password} onClick={emailOff}>Turn off</Button>}>
        <TextField label="Your password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>
    </Section>
  );
}

function OptionRow({ title, badge, body, action }: { title: string; badge?: string; body: string; action: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] px-1 py-1">
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-forest">
          {title}
          {badge && <span className="ml-2 rounded-full bg-turquoise-50 px-2 py-0.5 text-[11px] font-semibold text-turquoise-700">{badge}</span>}
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-forest/60">{body}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="mt-3">
      <label htmlFor={id} className="sr-only">6-digit code</label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="h-14 w-full rounded-[14px] bg-[#f3f5f4] text-center font-mono text-[26px] font-semibold tracking-[0.4em] text-forest outline-none ring-1 ring-transparent placeholder:text-forest/20 focus-visible:ring-2 focus-visible:ring-turquoise"
      />
    </div>
  );
}

// ─── Notifications ──────────────────────────────────────────────────────────

const PREFS = [
  { key: "emailTransactions" as const, title: "Money movement", desc: "Deposits, transfers and payment updates" },
  { key: "emailSecurity" as const, title: "Security", desc: "New sign-ins and security changes" },
  { key: "emailProduct" as const, title: "News and tips", desc: "Occasional product updates" },
];
type PrefKey = (typeof PREFS)[number]["key"];

function NotificationsSection() {
  const qc = useQueryClient();
  const [demoPrefs, setDemoPrefs] = useState<Record<PrefKey, boolean>>({ emailTransactions: true, emailSecurity: true, emailProduct: false });
  const q = useQuery({ queryKey: ["preferences"], queryFn: () => fetch("/api/users/preferences").then((r) => r.json()), enabled: !DEMO_MODE });
  const prefs: Record<PrefKey, boolean> = DEMO_MODE
    ? demoPrefs
    : {
        emailTransactions: q.data?.data?.emailTransactions ?? true,
        emailSecurity: q.data?.data?.emailSecurity ?? true,
        emailProduct: q.data?.data?.emailProduct ?? false,
      };

  async function toggle(key: PrefKey, value: boolean) {
    if (DEMO_MODE) return setDemoPrefs((p) => ({ ...p, [key]: value }));
    qc.setQueryData(["preferences"], (old: { data?: object } | undefined) => ({ ...(old ?? {}), data: { ...(old?.data ?? {}), ...prefs, [key]: value } }));
    try {
      await postJson("/api/users/preferences", { [key]: value }, { method: "PATCH" });
    } catch {
      toast.error("Couldn't save that setting");
    } finally {
      qc.invalidateQueries({ queryKey: ["preferences"] });
    }
  }

  return (
    <Section icon="alerts" title="Email notifications" description="In-app notifications are always on. Choose what also reaches your inbox.">
      <ul className="divide-y divide-forest/[0.07]">
        {PREFS.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-[14.5px] font-semibold text-forest">{p.title}</p>
              <p className="text-[13px] text-forest/55">{p.desc}</p>
            </div>
            <Switch checked={prefs[p.key]} label={p.title} onChange={(v) => toggle(p.key, v)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
        checked ? "bg-forest" : "bg-forest/20"
      )}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

// ─── Password ───────────────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!current) return setError("Enter your current password");
    if (next.length < 8 || !/[A-Z]/.test(next) || !/\d/.test(next)) return setError("Use at least 8 characters, with an uppercase letter and a number");
    if (next !== confirm) return setError("The new passwords don't match");
    setBusy(true);
    try {
      if (!DEMO_MODE) await postJson("/api/users/password", { currentPassword: current, newPassword: next }, { method: "PATCH" });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change your password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section icon="security" title="Password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} hint="At least 8 characters, with an uppercase letter and a number." />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" size="sm" loading={busy}>
          Change password
        </Button>
      </form>
    </Section>
  );
}
