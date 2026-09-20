import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Analytics aggregations (TODO Phase 8 — admin analytics dashboard).
//
// Server-only. Reads demo_requests, payfast_payments, clients and
// subscriptions via the service role and returns month-bucketed series plus
// headline figures (MRR, churn) for /dashboard/admin/analytics.
// ---------------------------------------------------------------------------

const SITE_SUPABASE_URL = process.env.SITE_SUPABASE_URL;
const SITE_SUPABASE_SERVICE_ROLE_KEY = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;

function createSiteClient() {
  if (!SITE_SUPABASE_URL || !SITE_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and " +
        "SITE_SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
  }
  return createClient<Database>(SITE_SUPABASE_URL, SITE_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export interface MonthPoint {
  month: string; // "2026-09"
  leads: number;
  bookings: number;
  revenueGross: number;
  revenueNet: number;
}

export interface AnalyticsSnapshot {
  series: MonthPoint[];
  totals: {
    leads: number;
    newLeads: number;
    contactedLeads: number;
    archivedLeads: number;
    bookings: number;
    upcomingBookings: number;
    avgLeadScore: number | null;
    hotLeads: number;
    revenueGross: number;
    revenueNet: number;
    activeClients: number;
    prospectClients: number;
    mrr: number;
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    cancelledSubscriptions: number;
    churnRate: number | null; // 0..1, cancelled / ever-active
  };
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function lastNMonthKeys(n: number, now = new Date()): string[] {
  const keys: string[] = [];
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    keys.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const supabase = createSiteClient();
  const now = new Date();

  const [requests, payments, bookings, clients, subscriptions] = await Promise.all([
    supabase.from("demo_requests").select("created_at, status, score, score_tier"),
    supabase
      .from("payfast_payments")
      .select("created_at, amount_gross, amount_net, status"),
    supabase.from("demo_bookings").select("created_at, slot_start, status"),
    supabase.from("clients").select("project_status"),
    supabase.from("subscriptions").select("status, amount"),
  ]);

  const requestRows = requests.data ?? [];
  const paymentRows = payments.data ?? [];
  const bookingRows = bookings.data ?? [];
  const clientRows = clients.data ?? [];
  const subscriptionRows = subscriptions.data ?? [];

  // ── Month series ──────────────────────────────────────────────────────
  const months = lastNMonthKeys(12, now);
  const byMonth = new Map<string, MonthPoint>(
    months.map((m) => [
      m,
      { month: m, leads: 0, bookings: 0, revenueGross: 0, revenueNet: 0 },
    ])
  );

  for (const r of requestRows) {
    const key = monthKey(r.created_at);
    const point = byMonth.get(key);
    if (point) point.leads++;
  }

  for (const b of bookingRows) {
    const key = monthKey(b.created_at ?? b.slot_start);
    const point = byMonth.get(key);
    if (point) point.bookings++;
  }

  for (const p of paymentRows) {
    if (p.status !== "complete") continue;
    const key = monthKey(p.created_at);
    const point = byMonth.get(key);
    if (point) {
      point.revenueGross += Number(p.amount_gross) || 0;
      point.revenueNet += Number(p.amount_net) || 0;
    }
  }

  // ── Lead totals ───────────────────────────────────────────────────────
  const scored = requestRows.filter((r) => typeof r.score === "number");
  const avgLeadScore = scored.length
    ? scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length
    : null;

  // ── Revenue totals ────────────────────────────────────────────────────
  const completed = paymentRows.filter((p) => p.status === "complete");
  const revenueGross = completed.reduce((s, p) => s + (Number(p.amount_gross) || 0), 0);
  const revenueNet = completed.reduce((s, p) => s + (Number(p.amount_net) || 0), 0);

  // ── Subscriptions / MRR / churn ───────────────────────────────────────
  const activeSubs = subscriptionRows.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((s, sub) => s + (Number(sub.amount) || 0), 0);
  const cancelled = subscriptionRows.filter((s) => s.status === "cancelled").length;
  const everActive = subscriptionRows.filter((s) => s.status !== "past_due").length;
  const churnRate = subscriptionRows.length ? cancelled / Math.max(1, everActive) : null;

  return {
    series: months.map((m) => byMonth.get(m)!),
    totals: {
      leads: requestRows.length,
      newLeads: requestRows.filter((r) => r.status === "new").length,
      contactedLeads: requestRows.filter((r) => r.status === "contacted").length,
      archivedLeads: requestRows.filter((r) => r.status === "archived").length,
      bookings: bookingRows.length,
      upcomingBookings: bookingRows.filter(
        (b) => b.status === "scheduled" && new Date(b.slot_start) > now
      ).length,
      avgLeadScore: avgLeadScore === null ? null : Math.round(avgLeadScore),
      hotLeads: requestRows.filter((r) => r.score_tier === "hot").length,
      revenueGross,
      revenueNet,
      activeClients: clientRows.filter((c) => c.project_status === "active").length,
      prospectClients: clientRows.filter((c) => c.project_status === "prospect").length,
      mrr,
      activeSubscriptions: activeSubs.length,
      pastDueSubscriptions: subscriptionRows.filter((s) => s.status === "past_due").length,
      cancelledSubscriptions: cancelled,
      churnRate,
    },
  };
}
