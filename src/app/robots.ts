import type { MetadataRoute } from "next";

// Crawlers get the public site only. Signed-in areas redirect to /login anyway;
// this keeps them (and the API) out of search results entirely.
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/app", "/dashboard", "/design", "/onboarding", "/settings", "/login", "/forgot-password", "/reset-password", "/verify-email", "/magic"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
