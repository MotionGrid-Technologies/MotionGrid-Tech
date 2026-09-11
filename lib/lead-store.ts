import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { scoreLead } from "@/lib/lead-scoring";

// ---------------------------------------------------------------------------
// MotionGrid lead store. Replaces the old better-sqlite3 store (lib/db.ts).
// Data lives in MotionGrid's own Supabase project (SITE_SUPABASE_*), separate
// from the Autofield multi-tenant project (NEXT_PUBLIC_SUPABASE_*).
//
// Access is server-only. Both the public contact form's Server Action and the
// admin dashboard use the service role, so RLS (which has no permissive
// policies for these tables) is bypassed and no user session is required.
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DemoRequestStatus = "new" | "contacted" | "archived";

export type DemoRequest = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: DemoRequestStatus;
  created_at: string;
  score: number | null;
  score_tier: string | null;
};

export type PayFastPaymentStatus =
  | "pending"
  | "complete"
  | "failed"
  | "cancelled";

export type PayFastPayment = {
  id: string;
  pf_payment_id: string;
  item_name: string;
  name_first: string;
  name_last: string;
  email_address: string;
  amount_gross: number;
  amount_fee: number;
  amount_net: number;
  currency: string;
  status: PayFastPaymentStatus;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Demo requests
// ---------------------------------------------------------------------------
export async function insertDemoRequest(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ score: number; tier: string }> {
  // Score at intake (TODO Phase 8) so every lead carries its rank from the
  // moment it lands.
  const { score, tier, breakdown } = scoreLead(input);

  const { error } = await createSiteClient()
    .from("demo_requests")
    .insert({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      message: input.message,
      score,
      score_tier: tier,
      score_breakdown: breakdown,
    });

  if (error) throw error;
  return { score, tier };
}

export async function listDemoRequests(): Promise<DemoRequest[]> {
  const { data, error } = await createSiteClient()
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status as DemoRequestStatus,
    created_at: row.created_at,
    score: row.score,
    score_tier: row.score_tier,
  }));
}

export async function updateDemoRequestStatus(
  id: string,
  status: DemoRequestStatus
): Promise<void> {
  const { error } = await createSiteClient()
    .from("demo_requests")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteDemoRequest(id: string): Promise<void> {
  const { error } = await createSiteClient()
    .from("demo_requests")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// PayFast payments — read-only for now (no ITN webhook wired up yet).
// ---------------------------------------------------------------------------
export async function listPayFastPayments(): Promise<PayFastPayment[]> {
  const { data, error } = await createSiteClient()
    .from("payfast_payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    pf_payment_id: row.pf_payment_id,
    item_name: row.item_name,
    name_first: row.name_first,
    name_last: row.name_last,
    email_address: row.email_address,
    amount_gross: Number(row.amount_gross),
    amount_fee: Number(row.amount_fee),
    amount_net: Number(row.amount_net),
    currency: row.currency,
    status: row.status as PayFastPaymentStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}
