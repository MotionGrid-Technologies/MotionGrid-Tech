"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { getCookieConsent } from "@/lib/cookies";

/**
 * PostHog analytics.
 *
 * Respects user cookie consent. Only initializes if consent is 'accepted'.
 */
export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    if (!key) return;

    const initPostHog = () => {
      const consent = getCookieConsent();
      if (consent === "accepted") {
        posthog.init(key, {
          api_host: host,
          person_profiles: "identified_only",
          capture_pageview: true,
        });
      }
    };

    initPostHog();

    window.addEventListener("cookie_consent_updated", initPostHog);
    return () => window.removeEventListener("cookie_consent_updated", initPostHog);
  }, []);

  return null;
}

