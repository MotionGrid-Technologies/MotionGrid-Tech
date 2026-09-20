"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSiteSupabaseServerClient, getRoleFromJWT } from "@/lib/siteSupabaseServer";
import {
  deleteReview,
  insertReview,
  updateReviewStatus,
  type ReviewStatus,
} from "@/lib/reviews-store";

async function requireDashboardAccess(): Promise<boolean> {
  const supabase = await createSiteSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return false;
  const role = getRoleFromJWT(data.claims);
  return role === "admin" || role === "super_admin";
}

function validateReviewInput(input: {
  name: string;
  quote: string;
  rating: number;
}): string | null {
  if (input.name.trim().length < 2) return "A name is required.";
  if (input.quote.trim().length < 5) return "The review quote is too short.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return "Rating must be between 1 and 5.";
  }
  return null;
}

export async function addReview(formData: FormData): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  const error = validateReviewInput({ name, quote, rating });
  if (error) throw new Error(error);

  await insertReview({ name, role, company, quote, rating });
  revalidatePath("/dashboard/admin/marketing/reviews");
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");
  await updateReviewStatus(id, status);
  revalidatePath("/dashboard/admin/marketing/reviews");
}

export async function removeReview(id: string): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");
  await deleteReview(id);
  revalidatePath("/dashboard/admin/marketing/reviews");
}