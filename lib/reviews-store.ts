import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Review store — admin-managed testimonials.
//
// Server-only. Uses the MotionGrid service role (same pattern as
// lib/lead-store.ts). RLS is enabled with no permissive policies, so only
// the service role (server code) can read/write; public pages read approved
// reviews through this module.
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

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewInput = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
};

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    quote: row.quote,
    rating: row.rating,
    status: row.status as ReviewStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Approved reviews for public surfaces (homepage strip, /testimonials). */
export async function listApprovedReviews(): Promise<Review[]> {
  const { data, error } = await createSiteClient()
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapReview);
}

/** All reviews for the admin console. */
export async function listReviews(): Promise<Review[]> {
  const { data, error } = await createSiteClient()
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReview);
}

export async function insertReview(input: ReviewInput): Promise<Review> {
  const { data, error } = await createSiteClient()
    .from("reviews")
    .insert({
      name: input.name,
      role: input.role,
      company: input.company,
      quote: input.quote,
      rating: input.rating,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapReview(data);
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<void> {
  const { error } = await createSiteClient()
    .from("reviews")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await createSiteClient()
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) throw error;
}