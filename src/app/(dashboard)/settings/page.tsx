"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Loader2,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_SESSION, DEMO_CUSTOMER } from "@/lib/demo-data";

// ─── Small local toggle (same visual as the card page controls) ─────────────

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted-foreground/25"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: realSession, update } = useSession();
  const session = DEMO_MODE ? DEMO_SESSION : realSession;
  const [name, setName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentName = name ?? session?.user?.name ?? "";
  const dirty = name !== null && name.trim() !== (session?.user?.name ?? "");

  async function save() {
    if (!dirty) return;
    setSaving(true);
    try {
      if (!DEMO_MODE) {
        const res = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: currentName.trim() }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error?.message || "Update failed");
        await update?.({ name: currentName.trim() });
      }
      toast.success("Profile updated");
      setName(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <CardTitle className="text-base">Profile</CardTitle>
        </div>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={currentName}
            onChange={(e) => setName(e.target.value)}
            maxLength={70}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={session?.user?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">
            Email changes require identity re-verification — contact support.
          </p>
        </div>
        {dirty && (
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Verification status ─────────────────────────────────────────────────────

function VerificationSection() {
  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE ? DEMO_CUSTOMER : customerRes?.data || customerRes;
  const status: string = customer?.kycStatus ?? "pending";
  const verified = status === "active";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <CardTitle className="text-base">Identity verification</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              verified
                ? "bg-primary/10 text-primary"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            )}
          >
            {verified ? "Verified" : status.replace(/_/g, " ")}
          </Badge>
        </div>
        <CardDescription>
          {verified
            ? "Your identity is verified — deposits, sends, and withdrawals are enabled."
            : "Finish verifying your identity to unlock money movement."}
        </CardDescription>
      </CardHeader>
      {!verified && (
        <CardContent>
          <a href="/onboarding" className="text-sm font-medium text-primary hover:underline">
            Continue verification →
          </a>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Two-factor authentication ───────────────────────────────────────────────

function TwoFactorSection() {
  const queryClient = useQueryClient();
  const [demoEnabled, setDemoEnabled] = useState(false);
  const { data: statusRes } = useQuery({
    queryKey: ["2fa-status"],
    queryFn: () => fetch("/api/auth/2fa").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const enabled = DEMO_MODE ? demoEnabled : Boolean(statusRes?.data?.enabled);

  const [phase, setPhase] = useState<"idle" | "enrolling" | "disabling">("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function beginEnroll() {
    setBusy(true);
    try {
      if (DEMO_MODE) {
        // Demo: fabricate a QR so the flow is explorable without a session.
        const demoUrl = "otpauth://totp/Moneta:alex@demo.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Moneta";
        setQrDataUrl(await QRCode.toDataURL(demoUrl, { margin: 1, width: 220 }));
        setManualSecret("JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP");
      } else {
        const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error?.message || "Setup failed");
        setQrDataUrl(
          await QRCode.toDataURL(data.data.otpauthUrl, { margin: 1, width: 220 })
        );
        setManualSecret(data.data.secret);
      }
      setPhase("enrolling");
      setCode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(endpoint: "verify" | "disable") {
    setBusy(true);
    try {
      if (DEMO_MODE) {
        setDemoEnabled(endpoint === "verify");
      } else {
        const res = await fetch(`/api/auth/2fa/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error?.message || "Invalid code");
        queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      }
      toast.success(
        endpoint === "verify"
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      );
      setPhase("idle");
      setQrDataUrl(null);
      setManualSecret(null);
      setCode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <CardTitle className="text-base">Two-factor authentication</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={cn(enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}
          >
            {enabled ? "On" : "Off"}
          </Badge>
        </div>
        <CardDescription>
          Require a code from your authenticator app every time you sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "idle" && !enabled && (
          <Button onClick={beginEnroll} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable 2FA
          </Button>
        )}
        {phase === "idle" && enabled && (
          <Button variant="outline" onClick={() => { setPhase("disabling"); setCode(""); }}>
            Disable 2FA
          </Button>
        )}

        {phase === "enrolling" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-5 sm:flex-row sm:items-start">
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="2FA enrollment QR code" className="h-[140px] w-[140px] rounded-lg bg-white p-2" />
              )}
              <div className="space-y-2 text-sm">
                <p className="font-medium">1. Scan with your authenticator app</p>
                <p className="text-muted-foreground">
                  Google Authenticator, 1Password, Authy — any TOTP app works.
                </p>
                {manualSecret && (
                  <p className="text-xs text-muted-foreground">
                    Or enter manually:{" "}
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
                      {manualSecret}
                    </code>
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollCode">2. Enter the 6-digit code</Label>
              <div className="flex gap-2">
                <Input
                  id="enrollCode"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="max-w-[160px] text-center tracking-[0.3em] tabular-nums"
                />
                <Button onClick={() => confirm("verify")} disabled={busy || code.length !== 6}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & enable
                </Button>
                <Button variant="ghost" onClick={() => setPhase("idle")} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {phase === "disabling" && (
          <div className="space-y-2">
            <Label htmlFor="disableCode">Enter a current code to confirm</Label>
            <div className="flex gap-2">
              <Input
                id="disableCode"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="max-w-[160px] text-center tracking-[0.3em] tabular-nums"
              />
              <Button
                variant="destructive"
                onClick={() => confirm("disable")}
                disabled={busy || code.length !== 6}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable
              </Button>
              <Button variant="ghost" onClick={() => setPhase("idle")} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Notification preferences ────────────────────────────────────────────────

const PREF_ROWS = [
  {
    key: "emailTransactions" as const,
    title: "Transaction emails",
    desc: "Deposits, transfers, and payment status changes",
  },
  {
    key: "emailSecurity" as const,
    title: "Security & verification emails",
    desc: "Sign-in security, 2FA changes, identity verification",
  },
  {
    key: "emailProduct" as const,
    title: "Product updates",
    desc: "New features and occasional announcements",
  },
];

function NotificationsSection() {
  const queryClient = useQueryClient();
  const [demoPrefs, setDemoPrefs] = useState({
    emailTransactions: true,
    emailSecurity: true,
    emailProduct: false,
  });
  const { data: prefsRes } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => fetch("/api/users/preferences").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const prefs = DEMO_MODE
    ? demoPrefs
    : {
        emailTransactions: prefsRes?.data?.emailTransactions ?? true,
        emailSecurity: prefsRes?.data?.emailSecurity ?? true,
        emailProduct: prefsRes?.data?.emailProduct ?? false,
      };

  async function toggle(key: keyof typeof prefs, value: boolean) {
    if (DEMO_MODE) {
      setDemoPrefs((p) => ({ ...p, [key]: value }));
      return;
    }
    // Optimistic write-through
    queryClient.setQueryData(["preferences"], (old: { data?: object } | undefined) => ({
      ...(old ?? {}),
      data: { ...(old?.data ?? {}), ...prefs, [key]: value },
    }));
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      toast.error("Could not save preference");
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <CardTitle className="text-base">Email notifications</CardTitle>
        </div>
        <CardDescription>
          In-app notifications are always on; choose what also reaches your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {PREF_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{row.title}</p>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
            <Toggle
              checked={prefs[row.key]}
              onChange={(v) => toggle(row.key, v)}
              label={row.title}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Change password (existing behavior, unchanged API) ─────────────────────

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) { setError("Current password is required"); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Failed to update password");
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <CardTitle className="text-base">Change password</CardTitle>
        </div>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            At least 8 characters, one uppercase letter, and one number
          </p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>Password updated successfully!</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Avoid SSR/client drift on session-derived initial values.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Profile, security, and notifications</p>
      </div>

      <ProfileSection />
      <VerificationSection />
      <TwoFactorSection />
      <NotificationsSection />
      <PasswordSection />
    </div>
  );
}
