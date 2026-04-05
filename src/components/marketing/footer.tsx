import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">NeoBank</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log In
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NeoBank. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
