import type { NextConfig } from "next";

// Security headers applied to every response. HTTPS itself is enforced by
// the hosting platform (Vercel and most providers do this by default) —
// these headers harden what happens once a connection is already secure.
const siteSupabaseHost = process.env.SITE_SUPABASE_URL
  ? new URL(process.env.SITE_SUPABASE_URL).hostname
  : "";

// Content-Security-Policy. Stricter than default-src 'self' but relaxed
// exactly where the app needs it: Next.js inline hydration scripts/styles,
// Cloudflare Turnstile, PostHog (EU data residency), Supabase REST + Storage,
// and embedded YouTube. `unsafe-inline` is required for hydration, while
// `unsafe-eval` is limited to development tooling.
const unsafeEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${unsafeEval} https://challenges.cloudflare.com https://eu-assets.i.posthog.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  `https://${siteSupabaseHost} https://*.supabase.co https://eu.i.posthog.com https://eu-assets.i.posthog.com https://challenges.cloudflare.com`,
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
  // Don't leak the X-Powered-By: Next.js header.
  poweredByHeader: false,
  // Pin the Turbopack workspace root to this project: stray lockfiles in
  // parent directories (e.g. a user-home package-lock.json) otherwise make
  // Next infer the wrong root.
  turbopack: {
    root: __dirname,
  },
  // Tree-shake barrel exports so we only ship the lucide icons we actually use.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Serve AVIF when the client supports it, falling back to WebP.
    formats: ["image/avif", "image/webp"],
    ...(siteSupabaseHost
      ? {
          remotePatterns: [
            {
              protocol: "https",
              hostname: siteSupabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ],
        }
      : {}),
  },
};

export default nextConfig;
