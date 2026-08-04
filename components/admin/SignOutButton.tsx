"use client";

import { signOut } from "@/app/adminj2-v1/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
      >
        Sign out
      </button>
    </form>
  );
}