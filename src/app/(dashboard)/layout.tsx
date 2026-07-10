import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { KycBypassBanner } from "@/components/dev/kyc-bypass-banner";

// All dashboard pages are user-scoped and use ?account= URL state.
// Force them dynamic so Next.js doesn't try to prerender — the
// AccountSwitcher's useSearchParams() can't be statically resolved.
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <KycBypassBanner />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
