import { auth } from "@/lib/auth/config";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

// Shared chrome for standalone marketing pages (/security, /how-it-works).
// The home page renders its own Navbar/Footer via LandingPage, so it lives
// outside this group.
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[#0a1c1c] text-[#eef3f1]">
      <Navbar isAuthenticated={!!session} />
      <div className="h-16" aria-hidden />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
