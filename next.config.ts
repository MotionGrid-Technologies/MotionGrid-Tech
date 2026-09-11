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

// Allow Next/Image to optimize images served from MotionGrid's Supabase
// Storage (SITE_SUPABASE_URL). The host is read from the environment at config
// time so it is never hardcoded.
const siteSupabaseHost = process.env.SITE_SUPABASE_URL
  ? new URL(process.env.SITE_SUPABASE_URL).hostname
  : "";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project: stray lockfiles in
  // parent directories (e.g. a user-home package-lock.json) otherwise make
  // Next infer the wrong root.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: siteSupabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: siteSupabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
