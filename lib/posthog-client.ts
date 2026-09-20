import type posthogType from "posthog-js";
import { POSTHOG_HOST, POSTHOG_KEY, isPostHogConfigured } from "@/lib/posthog";
import { getCookieConsent } from "@/lib/cookies";

// posthog-js is intentionally never statically imported anywhere. It is only
// loaded — lazily, on demand — once the user has accepted analytics cookies,
// so the ~30kb library never ships in the initial bundle.
type PostHog = typeof posthogType;

let posthogPromise: Promise<PostHog | null> | null = null;

async function initPostHog(): Promise<PostHog | null> {
  const { default: posthog } = await import("posthog-js");
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2026-01-30",
    // Pageviews are captured manually in <PostHogProvider>. Disable
    // auto-capture to avoid double-counting on soft navigations.
    capture_pageview: false,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    persistence: "localStorage+cookie",
    // Never track anything until consent is applied below.
    opt_out_capturing_by_default: true,
  });
  return posthog;
}

// Loads and initializes PostHog once, then returns the singleton. Returns null
// when the environment isn't configured. Does not gate on consent — callers
// that must not track without consent should use getPostHogIfConsented().
export function getPostHog(): Promise<PostHog | null> {
  if (!isPostHogConfigured) return Promise.resolve(null);
  if (!posthogPromise) {
    posthogPromise = initPostHog().catch((error) => {
      console.error("[posthog] failed to initialize", error);
      return null;
    });
  }
  return posthogPromise;
}

// Convenience for event call sites: only load PostHog once the visitor has
// accepted analytics cookies, so consent is never the side-effect of a call.
export async function getPostHogIfConsented(): Promise<PostHog | null> {
  if (getCookieConsent() !== "accepted") return null;
  return getPostHog();
}

// Applies the visitor's current consent choice to an initialized PostHog.
export async function applyPostHogConsent(): Promise<void> {
  const accepted = getCookieConsent() === "accepted";
  if (accepted) {
    const posthog = await getPostHog();
    if (!posthog) return;
    posthog.set_config({ persistence: "localStorage+cookie" });
    posthog.opt_in_capturing();
  } else {
    // Only touch PostHog if it has already been loaded; don't load it just to
    // record an opt-out.
    if (!posthogPromise) return;
    const posthog = await posthogPromise;
    if (!posthog) return;
    posthog.opt_out_capturing();
    posthog.set_config({ persistence: "memory" });
  }
}