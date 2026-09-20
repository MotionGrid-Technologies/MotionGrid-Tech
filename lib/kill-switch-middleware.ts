import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// MotionGrid client-app kill switch (TODO Phase 6).
//
// COPY THIS FILE into every client Next.js app MotionGrid hosts, then wire
// it into the app's middleware chain. It checks the client's subscription
// status against MotionGrid's status feed and redirects visitors to the
// suspension page when the subscription is no longer healthy.
//
// Setup in the CLIENT app:
//   1. Copy this file to <client-app>/lib/kill-switch-middleware.ts.
//   2. Env vars in the client app:
//        MOTIONGRID_STATUS_URL=https://motiongrid.co.za/api/subscription-status
//        MOTIONGRID_KILL_SWITCH_KEY=<same value as MotionGrid's KILL_SWITCH_API_KEY>
//        CLIENT_DOMAIN=<the client's registered domain, e.g. top-life.co.za>
//        SUSPENDED_REDIRECT_URL=https://hosting-suspended.motiongrid.co.za
//   3. Call `killSwitch(request)` from the client app's middleware (or mount
//      this file's exported `middleware` directly if the app has no other
//      middleware), keeping the matcher list below.
//
// Behaviour:
//   - healthy / unknown domain  -> request passes through untouched.
//   - unhealthy subscription    -> 302 to the suspension page (which carries
//                                  a payment-update form and auto-restores
//                                  once payment clears).
//   - Feed errors / timeouts    -> fail-open (traffic flows) and the error is
//                                  logged; a monitoring blip must never take
//                                  a paying client's site down.
//   - Result cached in-memory for 5 minutes per app instance.
// ---------------------------------------------------------------------------

const STATUS_URL = process.env.MOTIONGRID_STATUS_URL ?? "";
const KILL_SWITCH_KEY = process.env.MOTIONGRID_KILL_SWITCH_KEY ?? "";
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN ?? "";
const SUSPENDED_REDIRECT_URL =
  process.env.SUSPENDED_REDIRECT_URL ?? "https://hosting-suspended.motiongrid.co.za";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { healthy: boolean; at: number } | null = null;

async function fetchHealthy(): Promise<boolean> {
  if (!STATUS_URL || !KILL_SWITCH_KEY || !CLIENT_DOMAIN) {
    // Not configured in this app — never lock anyone out.
    return true;
  }

  try {
    const res = await fetch(
      `${STATUS_URL}?domain=${encodeURIComponent(CLIENT_DOMAIN)}`,
      {
        headers: { "x-kill-switch-key": KILL_SWITCH_KEY },
        signal: AbortSignal.timeout(4000),
        // Bypass this app's own middleware to avoid loops.
        cache: "no-store",
      }
    );

    if (!res.ok) return true; // fail-open

    const data = (await res.json()) as { healthy?: boolean };
    return data.healthy !== false;
  } catch (error) {
    console.error("[kill-switch] status check failed (fail-open)", error);
    return true;
  }
}

async function isHealthy(): Promise<boolean> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.healthy;
  const healthy = await fetchHealthy();
  cache = { healthy, at: Date.now() };
  return healthy;
}

/** Drop-in middleware export for client apps without their own middleware. */
export async function middleware(request: NextRequest) {
  const healthy = await isHealthy();
  if (healthy) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.href = SUSPENDED_REDIRECT_URL;
  return NextResponse.redirect(url, 302);
}

/** Composable helper for client apps that already have a middleware. */
export async function killSwitch(
  request: NextRequest
): Promise<NextResponse | null> {
  const healthy = await isHealthy();
  if (healthy) return null;

  const url = request.nextUrl.clone();
  url.href = SUSPENDED_REDIRECT_URL;
  return NextResponse.redirect(url, 302);
}

export const config = {
  // Skip static assets and the suspension page itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)).*)"],
};
