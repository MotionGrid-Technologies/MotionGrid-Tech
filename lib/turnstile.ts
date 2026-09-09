// Server-side Cloudflare Turnstile verification. Client forms pass the token
// from the widget via a hidden "cf-turnstile-response" field; server actions
// call verifyTurnstileToken to confirm the token is genuine before proceeding.

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token: string,
  expectedAction?: string,
): Promise<boolean> {
  if (!token || token.length > 2048) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is missing");
    return false;
  }

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success !== true) return false;

    // When the widget is configured with an action, verify it matches so a
    // token minted for one form cannot be replayed against another.
    if (expectedAction && data.action !== expectedAction) return false;

    return true;
  } catch (err) {
    console.error("[turnstile] siteverify failed", err);
    return false;
  }
}
