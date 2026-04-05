import { auth } from "@/lib/auth/config";
import { LandingPage } from "@/components/marketing/landing-page";

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session;

  return <LandingPage isAuthenticated={isAuthenticated} />;
}
