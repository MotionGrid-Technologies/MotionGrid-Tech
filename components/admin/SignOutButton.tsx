"use client";

import posthog from "posthog-js";
import { signOut } from "@/app/adminj2-v1/actions";

const posthogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function SignOutButton() {
  return (
    <form
      action={signOut}
      onSubmit={() => {
        if (posthogConfigured) posthog.reset();
      }}
    >
      <button
        type="submit"
        className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
      >
        Sign out
      </button>
    </form>
  );
}