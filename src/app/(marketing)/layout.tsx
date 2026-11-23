import { SiteShell } from "@/components/bank-site/page-parts";

// Shared chrome for standalone public pages (/security, /how-it-works) —
// the retail-bank style header/footer used by /personal.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
