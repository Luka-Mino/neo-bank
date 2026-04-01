"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-muted-foreground">
          {sent
            ? "Check your inbox for the reset link"
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="font-medium mb-1">Email sent!</p>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Check your inbox and spam folder.
                </p>
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Didn&apos;t receive it? Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
