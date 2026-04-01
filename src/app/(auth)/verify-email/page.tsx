"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Your email has been verified!");
        } else {
          setStatus("error");
          setMessage(data.error?.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <Card>
      <CardContent className="p-6 text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Verifying your email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="font-medium mb-1">{message}</p>
              <p className="text-sm text-muted-foreground">
                You can now access all features of your account.
              </p>
            </div>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Sign In
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20">
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <p className="font-medium mb-1">Verification failed</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
