"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <Home className="w-4 h-4 mr-1.5" />
                Go Home
              </Button>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
