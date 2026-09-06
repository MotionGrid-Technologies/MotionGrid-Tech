const COOKIE_CONSENT_KEY = "mg_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentStatus = "accepted" | "declined" | "undecided";

export function getCookieConsent(): ConsentStatus {
  if (typeof document === "undefined") return "undecided";

  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_KEY}=`));

  const value = match?.split("=")[1];
  return value === "accepted" || value === "declined" ? value : "undecided";
}

export function setCookieConsent(status: Exclude<ConsentStatus, "undecided">) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_CONSENT_KEY}=${status}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
}
