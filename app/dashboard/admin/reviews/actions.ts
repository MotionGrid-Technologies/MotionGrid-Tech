"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-utils";
import { setReviewStatus, type ReviewStatus } from "@/lib/reviews-store";

export async function setReviewStatusAction(id: string, status: ReviewStatus) {
  if (!(await requireAdminSession())) redirect("/login");

  await setReviewStatus(id, status);
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath("/testimonials");
}
