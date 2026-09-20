"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPostHogIfConsented, applyPostHogConsent } from "@/lib/posthog-client";
import { isPostHogConfigured } from "@/lib/posthog";
import { buildPostHogPageviewUrl } from "@/lib/posthog-pageview";

// Captures a $pageview for the initial load and every client-side navigation.
// Wrapped in <Suspense> because useSearchParams opts the route into dynamic
// rendering and requires a Suspense boundary. posthog-js is loaded lazily only
// when the visitor has accepted analytics cookies.
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPostHogConfigured || !pathname) return;

    const url = buildPostHogPageviewUrl(
      window.location.origin,
      pathname,
      new URLSearchParams(searchParams.toString()),
    );
    if (!url) return;

    let cancelled = false;
    // Consent-gated: does not even load posthog-js until the visitor accepts
    // analytics cookies.
    getPostHogIfConsented().then(async (posthog) => {
      if (cancelled || !posthog) return;
      // Ensure the freshly-loaded instance is opted in before capturing.
      await applyPostHogConsent();
      posthog.capture("$pageview", { $current_url: url });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider() {
  useEffect(() => {
    if (!isPostHogConfigured) return;

    applyPostHogConsent();
    window.addEventListener("cookie_consent_updated", applyPostHogConsent);
    return () =>
      window.removeEventListener("cookie_consent_updated", applyPostHogConsent);
  }, []);

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}