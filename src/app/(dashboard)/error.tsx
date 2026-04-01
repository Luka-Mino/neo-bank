"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <Home className="w-4 h-4 mr-1.5" />
            Go Home
          </Button>
          <Button onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Try Again
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-xs text-muted-foreground font-mono">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
