"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { getCookieConsent } from "@/lib/cookies";

const posthogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function PostHogProvider() {
  useEffect(() => {
    if (!posthogConfigured) return;

    const syncConsent = () => {
      if (getCookieConsent() === "accepted") {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    };

    syncConsent();
    window.addEventListener("cookie_consent_updated", syncConsent);
    return () => window.removeEventListener("cookie_consent_updated", syncConsent);
  }, []);

  return null;
}

