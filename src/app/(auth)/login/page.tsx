"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  // Revealed only after the server confirms the password AND says the
  // account has 2FA (error code "2fa_required").
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totp, setTotp] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      ...(needsTotp && totp ? { totp } : {}),
      redirect: false,
    });

    if (result?.error) {
      const code = (result as { code?: string }).code;
      if (code === "2fa_required") {
        setNeedsTotp(true);
      } else if (code === "2fa_invalid") {
        setNeedsTotp(true);
        setError("That code didn't work — check your authenticator app.");
      } else if (code === "rate_limited") {
        setError("Too many sign-in attempts. Please wait 15 minutes and try again.");
      } else if (result.error === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError(`Sign in failed: ${result.error}`);
      }
    } else if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Sign in failed. Please try again.");
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
          </div>
          {needsTotp && (
            <div className="space-y-2 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20">
              <Label htmlFor="totp" className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Authenticator code
              </Label>
              <Input
                id="totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="text-center text-lg tracking-[0.4em] tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || (needsTotp && totp.length !== 6)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {needsTotp ? "Verify & sign in" : "Sign In"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
