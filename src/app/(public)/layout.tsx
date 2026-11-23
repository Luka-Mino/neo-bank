import { SiteShell } from "@/components/bank-site/page-parts";

// Legal pages (/privacy, /terms) share the retail-bank site chrome.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
