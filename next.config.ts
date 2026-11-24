import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/legacy-routes";

// Baseline security headers for a money app. The Content-Security-Policy is
// per request (nonce-based) and set in src/proxy.ts, which is why the root
// layout renders every page per request.
const securityHeaders = [
  // Two years, subdomains included — browsers ignore HSTS over plain HTTP,
  // so this is inert in local dev.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // The classic dashboard's old URLs → their /app screens (src/lib/legacy-routes.ts).
  async redirects() {
    return legacyRedirects();
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
