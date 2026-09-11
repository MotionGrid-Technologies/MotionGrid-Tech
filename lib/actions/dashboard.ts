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
import {
  createBooking,
  updateBookingStatus,
  type BookingStatus,
} from "@/lib/booking-store";
import { enrollLeadInSequence } from "@/lib/email-sequences";
import { createSiteSupabaseServerClient, getRoleFromJWT } from "@/lib/siteSupabaseServer";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limiter";
import {
  sendContactFormAdminNotification,
  sendDemoConfirmationEmail,
  sendBookingAdminNotification,
  sendBookingConfirmationEmail,
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

function validateLeadFields(input: {
  name: string;
  email: string;
  message: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (input.name.length < 2) errors.name = "Your name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "A valid email is required.";
  if (input.message.length < 5) errors.message = "Tell us a little about the problem.";
  return errors;
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

  const errors = validateLeadFields({ name, email, message });
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

  // Fire marketing emails (admin notification + prospect confirmation) and
  // enroll the lead in the welcome sequence (step 1 sends immediately). All
  // best-effort: failures never error the form submit.
  await Promise.allSettled([
    sendContactFormAdminNotification({ name, company, email, phone, message }),
    sendDemoConfirmationEmail({ name, email }),
    enrollLeadInSequence("welcome", { email, name }),
  ]);

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}

// ---------------------------------------------------------------------------
// Public submission — slot booking (Phase 3.3, "pick a 15-min slot").
// ---------------------------------------------------------------------------

export type BookingFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function bookDemoSlot(
  _prev: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  // Rate limit: 3 booking attempts per IP per 5 minutes.
  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = await checkRateLimit(`booking:${ip}`, {
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
  const slotIso = String(formData.get("slot") ?? "").trim();

  const errors = validateLeadFields({ name, email, message });
  if (!slotIso) errors.slot = "Pick a time slot first.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  let booking;
  try {
    const result = await createBooking({ name, company, email, phone, message, slotIso });
    if (!result.ok) {
      return { ok: false, message: result.message, errors: { slot: result.message } };
    }
    booking = result.booking;
    revalidatePath("/dashboard/admin/dashboard");
    revalidatePath("/dashboard/admin/analytics");
  } catch (err) {
    console.error("bookDemoSlot failed", err);
    return { ok: false, message: "Something went wrong saving your booking." };
  }

  // Confirmation (with .ics calendar invite) + admin notification + welcome
  // sequence enrollment — all best-effort.
  const emailData = {
    name,
    company,
    email,
    phone,
    message,
    slotStart: new Date(booking.slot_start),
    durationMinutes: booking.duration_minutes,
    bookingId: booking.id,
  };

  await Promise.allSettled([
    sendBookingConfirmationEmail(emailData),
    sendBookingAdminNotification(emailData),
    enrollLeadInSequence("welcome", { email, name }),
  ]);

  return {
    ok: true,
    message: "Booked — check your inbox for the confirmation and calendar invite.",
  };
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

export async function setBookingStatus(
  id: string,
  status: BookingStatus
): Promise<void> {
  if (!(await requireDashboardAccess())) redirect("/login");
  await updateBookingStatus(id, status);
  revalidatePath("/dashboard/admin/dashboard");
}
