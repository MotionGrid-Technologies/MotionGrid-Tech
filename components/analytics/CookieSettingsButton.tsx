"use client";

// Opens the cookie preferences banner. The CookieBanner component listens for
// the `cookie_settings_open` event so visitors can change their choice after
// the initial decision (not just by clearing cookies).
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("cookie_settings_open"))}
      className={className}
    >
      Cookie Settings
    </button>
  );
}