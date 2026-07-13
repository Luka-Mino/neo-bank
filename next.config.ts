import type { NextConfig } from "next";

// Baseline security headers for a money app. A strict CSP is deliberately
// deferred to M3 (needs nonce plumbing through Next's inline scripts);
// everything here is safe to ship without app changes.
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
