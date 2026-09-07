import posthog from "posthog-js";
import { POSTHOG_KEY, POSTHOG_HOST } from "@/lib/posthog";
import { getCookieConsent } from "@/lib/cookies";

// This file is Next.js App Router's client-side instrumentation entry point.
// It runs in the browser only, but the guard is a defensive measure so SSR or
// the build never touches `window`, `document`, or PostHog.
if (typeof window !== "undefined" && POSTHOG_KEY && POSTHOG_HOST) {
  // Until the user has explicitly accepted analytics cookies we must not drop
  // any tracking cookies. Initialize with in-memory persistence only, then
  // switch to persistent storage (localStorage+cookie) once consent is granted.
  const consentAccepted = getCookieConsent() === "accepted";

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2026-01-30",
    // Pageviews are captured manually in <PostHogProvider> (gated behind
    // consent). Disable auto-capture to avoid double-counting on soft navs.
    capture_pageview: false,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    persistence: consentAccepted ? "localStorage+cookie" : "memory",
    opt_out_capturing_by_default: !consentAccepted,
  });
} else if (process.env.NODE_ENV === "development") {
  if (!POSTHOG_KEY) {
    console.warn(
      "[posthog] NEXT_PUBLIC_POSTHOG_KEY is missing — events are being silently dropped.",
    );
  } else if (!POSTHOG_HOST) {
    console.warn(
      "[posthog] NEXT_PUBLIC_POSTHOG_HOST is missing — events are being silently dropped.",
    );
  }
}
