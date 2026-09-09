// Centralized PostHog client configuration. Everything that needs to know
// whether PostHog is configured reads from here instead of repeating env
// checks (and risking a typo / drift) across the codebase.
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "";

export const isPostHogConfigured = Boolean(POSTHOG_KEY && POSTHOG_HOST);
