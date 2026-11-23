import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { KycBypassBanner } from "@/components/dev/kyc-bypass-banner";

// User-scoped, client-data pages — never prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moneta",
  // Signed-in area: never index.
  robots: { index: false, follow: false },
};

export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <KycBypassBanner />
      <AppShell>{children}</AppShell>
    </div>
  );
}
