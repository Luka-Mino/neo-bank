"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Shield } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="font-medium mb-2">Invalid or missing reset link</p>
          <p className="text-sm text-muted-foreground mb-4">
            This password reset link is no longer valid. Please request a new
            one.
          </p>
          <Link
            href="/forgot-password"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Request New Link
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Please enter a new password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Something went wrong");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="font-medium mb-1">Password updated!</p>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. Redirecting you to
                sign in...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">New Password</h1>
        <p className="text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
