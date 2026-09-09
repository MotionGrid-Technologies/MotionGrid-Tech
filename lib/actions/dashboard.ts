"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  deleteDemoRequest,
  insertDemoRequest,
  updateDemoRequestStatus,
  type DemoRequestStatus,
} from "@/lib/lead-store";
import { createSiteSupabaseServerClient, getRoleFromJWT } from "@/lib/siteSupabaseServer";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limiter";
import {
  sendContactFormAdminNotification,
  sendDemoConfirmationEmail,
} from "@/lib/marketing-email";

// ---------------------------------------------------------------------------
// Public submission — used by the contact "Book a demo" form.
// No auth: this is the site's intake form, protected by Turnstile + rate limit.
// ---------------------------------------------------------------------------
export type DemoFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

async function requireDashboardAccess(): Promise<boolean> {
  const supabase = await createSiteSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return false;
  const role = getRoleFromJWT(data.claims);
  return role === "admin" || role === "super_admin";
}

export async function submitDemoRequest(
  _prev: DemoFormState,
  formData: FormData
): Promise<DemoFormState> {
  // Rate limit: 3 submissions per IP per 5 minutes.
  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = await checkRateLimit(`demo:${ip}`, {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    return { ok: false, message: "Too many requests. Please try again in a few minutes." };
  }

  const token = String(formData.get("cf-turnstile-response") ?? "");

  if (!token || !(await verifyTurnstileToken(token, "demo_request"))) {
    return { ok: false, message: "CAPTCHA verification failed. Please try again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Your name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "A valid email is required.";
  if (message.length < 5) errors.message = "Tell us a little about the problem.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  try {
    await insertDemoRequest({ name, company, email, phone, message });
    revalidatePath("/dashboard/admin/dashboard");
  } catch (err) {
    console.error("submitDemoRequest failed", err);
    return { ok: false, message: "Something went wrong saving your request." };
  }

  // Fire marketing emails (admin notification + prospect confirmation). These
  // are best-effort: each sender logs its own result to MotionGrid email_logs
  // and never throws, so a delivery failure does not error the form submit.
  await Promise.allSettled([
    sendContactFormAdminNotification({ name, company, email, phone, message }),
    sendDemoConfirmationEmail({ name, email }),
  ]);

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}

// ---------------------------------------------------------------------------
// Admin mutations. Access is checked against the Supabase session role
// (admin or super_admin); the /dashboard routes are also gated by middleware.
// ---------------------------------------------------------------------------

export async function setDemoRequestStatus(
  id: string,
  status: DemoRequestStatus
): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");
  await updateDemoRequestStatus(id, status);
  revalidatePath("/dashboard/admin/dashboard");
}

export async function removeDemoRequest(id: string): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");
  await deleteDemoRequest(id);
  revalidatePath("/dashboard/admin/dashboard");
}
