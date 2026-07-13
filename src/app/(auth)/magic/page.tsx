"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

function MagicConsume() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const attempted = useRef(false);

  const [status, setStatus] = useState<"working" | "2fa" | "error">("working");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);

  async function attempt(code?: string) {
    if (!token) {
      setStatus("error");
      return;
    }
    setBusy(true);
    const res = await signIn("magic-link", {
      token,
      ...(code ? { totp: code } : {}),
      redirect: false,
    });
    setBusy(false);

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const errCode = (res as { code?: string })?.code;
    if (errCode === "2fa_required" || errCode === "2fa_invalid") {
      setStatus("2fa");
    } else {
      setStatus("error");
    }
  }

  // Fire once on mount (a fresh, no-2FA link signs in immediately).
  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    attempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "working") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "2fa") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">
            <h1>One more step</h1>
          </CardTitle>
          <CardDescription>
            Enter the code from your authenticator app to finish signing in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totp" className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Authenticator code
            </Label>
            <Input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              spellCheck={false}
              maxLength={6}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              autoFocus
              className="text-center text-lg tracking-[0.4em] tabular-nums"
            />
          </div>
          <Button
            className="w-full"
            disabled={busy || totp.length !== 6}
            onClick={() => attempt(totp)}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">
          <h1>This link didn&apos;t work</h1>
        </CardTitle>
        <CardDescription>
          Sign-in links expire after 15 minutes and can be used once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          The link is invalid, expired, or already used.
        </div>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Request a new sign-in link →
        </Link>
      </CardContent>
    </Card>
  );
}

export default function MagicPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      }
    >
      <MagicConsume />
    </Suspense>
  );
}
