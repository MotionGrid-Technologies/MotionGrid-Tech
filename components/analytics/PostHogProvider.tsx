"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { getCookieConsent } from "@/lib/cookies";
import { isPostHogConfigured } from "@/lib/posthog";

// Captures a $pageview for the initial load and every client-side navigation.
// Wrapped in <Suspense> because useSearchParams opts the route into dynamic
// rendering and requires a Suspense boundary.
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPostHogConfigured || !pathname) return;

    let url = window.location.origin + pathname;
    const query = searchParams.toString();
    if (query) url += "?" + query;

    // Safe to call regardless of consent: PostHog no-ops when opted out.
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider() {
  useEffect(() => {
    if (!isPostHogConfigured) return;

    const syncConsent = () => {
      if (getCookieConsent() === "accepted") {
        posthog.set_config({ persistence: "localStorage+cookie" });
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
        posthog.set_config({ persistence: "memory" });
      }
    };

    syncConsent();
    window.addEventListener("cookie_consent_updated", syncConsent);
    return () => window.removeEventListener("cookie_consent_updated", syncConsent);
  }, []);

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
