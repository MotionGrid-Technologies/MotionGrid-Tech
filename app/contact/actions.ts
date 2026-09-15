"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  createMeetingBooking,
  formatSlotLabel,
  getBookableSlots,
  SlotTakenError,
} from "@/lib/meetings-store";
import {
  sendMeetingBookingAdminNotification,
  sendMeetingBookingConfirmationEmail,
} from "@/lib/marketing-email";

// ---------------------------------------------------------------------------
// Public 15-minute slot booking — powers the calendar on /contact.
// No auth: protected by Turnstile + rate limit. Writes go through the
// constrained service-role booking in lib/meetings-store.ts.
// ---------------------------------------------------------------------------

export async function getSlotsAction(dateISO: string) {
  return getBookableSlots(dateISO);
}

export type BookingState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function bookMeetingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
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
  if (!token || !(await verifyTurnstileToken(token, "meeting_booking"))) {
    return { ok: false, message: "CAPTCHA verification failed. Please try again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const slot = String(formData.get("slot") ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Your name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "A valid email is required.";
  if (!slot) errors.slot = "Pick a slot first.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  let scheduledAt: string;
  try {
    const booking = await createMeetingBooking({ name, company, email, phone, slot, notes });
    scheduledAt = booking.scheduledAt;
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return {
        ok: false,
        message: "That slot was just taken. Please pick another time.",
        errors: { slot: "Slot no longer available." },
      };
    }
    console.error("bookMeetingAction failed", err);
    return { ok: false, message: "Something went wrong booking your slot." };
  }

  const slotLabel = formatSlotLabel(scheduledAt);

  // Best-effort notifications — a delivery failure never errors the booking.
  await Promise.allSettled([
    sendMeetingBookingAdminNotification({ name, company, email, phone, notes, slot: slotLabel }),
    sendMeetingBookingConfirmationEmail({ name, email, slot: slotLabel }),
  ]);

  revalidatePath("/dashboard/admin/dashboard");

  return {
    ok: true,
    message: `Booked — ${slotLabel}. A confirmation email is on its way to ${email}.`,
  };
}
