import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Client-app kill switch status feed (TODO Phase 6).
//
// Every Next.js app MotionGrid hosts for a client drops
// lib/kill-switch-middleware.ts (see that file) into its middleware chain.
// The middleware calls THIS endpoint with the client's domain and redirects
// to the suspension page when the subscription is no longer healthy.
//
// Auth: shared secret via the x-kill-switch-key header (KILL_SWITCH_API_KEY
// env var on both sides). Responses are cached for 5 minutes by the
// middleware to keep cold starts cheap.
// ---------------------------------------------------------------------------

function authorized(request: Request): boolean {
  const secret = process.env.KILL_SWITCH_API_KEY;
  if (!secret) return false;
  return request.headers.get("x-kill-switch-key") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = (searchParams.get("domain") ?? "").trim().toLowerCase();
  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "domain query parameter required" }, { status: 400 });
  }

  const url = process.env.SITE_SUPABASE_URL;
  const key = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });

  // Find the client by domain, then its latest subscription.
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, project_status")
    .ilike("domain", `%${domain}`)
    .maybeSingle();

  if (!client) {
    // Unknown domain: treat as active so an unregistered app never locks out
    // its owner by accident.
    return NextResponse.json({ domain, known: false, healthy: true });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, next_billing_date")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({
      domain,
      known: true,
      healthy: true,
      project_status: client.project_status,
    });
  }

  const healthy = subscription.status === "active";

  return NextResponse.json({
    domain,
    known: true,
    healthy,
    project_status: client.project_status,
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      next_billing_date: subscription.next_billing_date,
    },
  });
}
