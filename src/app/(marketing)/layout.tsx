import { SiteShell } from "@/components/bank-site/page-parts";

// Shared chrome for standalone public pages (/security, /how-it-works) —
// the site header and footer used by the homepage.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
