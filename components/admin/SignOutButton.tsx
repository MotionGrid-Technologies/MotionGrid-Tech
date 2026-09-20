"use client";

import { signOut } from "@/app/login/actions";
import { getPostHogIfConsented } from "@/lib/posthog-client";

/** Renders a sign-out form that clears analytics state before ending the session. */
export function SignOutButton() {
  return (
    <form
      action={signOut}
      onSubmit={() => {
        getPostHogIfConsented().then((posthog) => {
          if (posthog) posthog.reset();
        });
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
