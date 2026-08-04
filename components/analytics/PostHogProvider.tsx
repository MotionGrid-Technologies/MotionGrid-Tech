"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog analytics.
 *
 * Wire-up is complete but intentionally inert: nothing initializes or
 * fires network requests unless NEXT_PUBLIC_POSTHOG_KEY is set in the
 * environment. To turn analytics on:
 *
 *   1. Create a PostHog project and grab the project API key + host.
 *   2. Add to .env.local:
 *        NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
 *        NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
 *   3. Redeploy. Pageviews are captured automatically by default.
 */
export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    if (!key) return; // analytics disabled until a key is configured

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
    });
  }, []);

  return null;
}
