import type { NextConfig } from "next";

// Security headers applied to every response. HTTPS itself is enforced by
// the hosting platform (Vercel and most providers do this by default) —
// these headers harden what happens once a connection is already secure.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // better-sqlite3 is a native Node addon — keep it out of the bundler so
  // the prebuilt .node binary loads at runtime on the server only.
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
