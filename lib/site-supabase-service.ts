import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Service-role client for the MotionGrid Supabase project. Server-only.
//
// Used where there is no user session to apply RLS against:
//   - the public, token-gated /proposal/[token] route (the public_token in
//     the URL is the access control; every query filters by that exact,
//     unguessable UUID and updates are constrained to valid transitions
//     inside the query itself),
//   - the public 15-minute meeting booking action (rate-limited + Turnstile
//     protected; writes are limited to a find-or-create on clients and a
//     single meetings insert).
//
// Do not reuse this client for any route that takes arbitrary user input
// without those kinds of constraints.
// ---------------------------------------------------------------------------
export function createSiteSupabaseServiceClient() {
  const url = process.env.SITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SITE_SUPABASE_URL;
  const key = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and " +
        "SITE_SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
  }

  return createClient<Database>(url, key, { auth: { persistSession: false } });
}
