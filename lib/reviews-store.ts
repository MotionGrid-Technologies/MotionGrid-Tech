import { createSiteSupabaseServiceClient } from "@/lib/site-supabase-service";

// ---------------------------------------------------------------------------
// MotionGrid reviews store — powers /testimonials (approved only) and the
// admin moderation queue at /dashboard/admin/reviews.
//
// Reads use the service-role client because the public testimonials page has
// no session; the reviews RLS policies are admin-only, so anon access is
// closed by design. Admin mutations go through server actions in
// app/dashboard/admin/reviews/actions.ts.
// ---------------------------------------------------------------------------

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewSource = "website" | "email" | "google" | "facebook" | "linkedin";

export interface Review {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  rating: number;
  quote: string;
  source: ReviewSource;
  status: ReviewStatus;
  createdAt: string;
}

function mapRow(row: {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  rating: number;
  quote: string;
  source: string;
  status: string;
  created_at: string;
}): Review {
  return {
    id: row.id,
    author: row.author,
    role: row.role,
    company: row.company,
    rating: row.rating,
    quote: row.quote,
    source: row.source as ReviewSource,
    status: row.status as ReviewStatus,
    createdAt: row.created_at,
  };
}

// The reviews migration may not have been run yet on a fresh environment.
// Treat a missing table as "no reviews" so the site degrades gracefully
// instead of erroring; surface every other error.
function isMissingTable(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ((error as { code?: string }).code === "42P01" ||
        (error instanceof Error && error.message.includes("does not exist")))
  );
}

const SELECT =
  "id, author, role, company, rating, quote, source, status, created_at";

export async function listReviews(filters?: {
  status?: ReviewStatus | "all";
}): Promise<Review[]> {
  const supabase = createSiteSupabaseServiceClient();

  let query = supabase.from("reviews").select(SELECT).order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  return (data ?? []).map(mapRow);
}

export async function listApprovedReviews(): Promise<Review[]> {
  return listReviews({ status: "approved" });
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const supabase = createSiteSupabaseServiceClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
