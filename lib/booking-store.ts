import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { validateSlot } from "@/lib/booking-slots";
import { scoreLead } from "@/lib/lead-scoring";

// ---------------------------------------------------------------------------
// Demo booking store (TODO Phase 3.3 — "pick a 15-min slot" flow).
//
// Server-only. Uses the MotionGrid service role (same pattern as
// lib/lead-store.ts). Slot rules live in lib/booking-slots.ts and are
// re-validated here before any insert; the partial unique index
// idx_demo_bookings_active_slot is the final guard against double-booking.
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

export type BookingStatus = "scheduled" | "cancelled" | "completed";

export type DemoBooking = {
  id: string;
  demo_request_id: string | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  slot_start: string;
  duration_minutes: number;
  status: BookingStatus;
  created_at: string;
};

const SAST_OFFSET_MS = 120 * 60_000;

/** UTC range covering one SAST calendar day. */
function sastDayRange(dateKey: string): { from: Date; to: Date } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - SAST_OFFSET_MS);
  return { from, to: new Date(from.getTime() + 24 * 60 * 60_000) };
}

/** ISO strings of already-scheduled slots on a SAST date (for the availability API). */
export async function getBookedSlotsForSastDate(dateKey: string): Promise<string[]> {
  const { from, to } = sastDayRange(dateKey);
  const { data, error } = await createSiteClient()
    .from("demo_bookings")
    .select("slot_start")
    .eq("status", "scheduled")
    .gte("slot_start", from.toISOString())
    .lt("slot_start", to.toISOString());

  if (error) throw error;
  return (data ?? []).map((row) => row.slot_start as string);
}

export interface CreateBookingInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  slotIso: string;
}

export type CreateBookingResult =
  | { ok: true; booking: DemoBooking; leadScore: number; leadTier: string }
  | { ok: false; code: "invalid_slot" | "slot_taken"; message: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const slotError = validateSlot(input.slotIso);
  if (slotError) {
    return {
      ok: false,
      code: "invalid_slot",
      message: "That time is not available. Please pick a slot from the list.",
    };
  }

  // Score the lead once — stored on the linked demo request.
  const score = scoreLead({
    name: input.name,
    company: input.company,
    email: input.email,
    phone: input.phone,
    message: input.message,
  });

  const supabase = createSiteClient();

  // Lead record first (mirrors the plain contact form so the admin dashboard
  // shows booked leads alongside message-only leads).
  const { data: requestRow, error: requestError } = await supabase
    .from("demo_requests")
    .insert({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      message: input.message,
      score: score.score,
      score_tier: score.tier,
      score_breakdown: score.breakdown,
    })
    .select("id")
    .single();

  if (requestError) throw requestError;

  const { data: bookingRow, error: bookingError } = await supabase
    .from("demo_bookings")
    .insert({
      demo_request_id: requestRow.id,
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      message: input.message,
      slot_start: input.slotIso,
      duration_minutes: 15,
    })
    .select("*")
    .single();

  if (bookingError) {
    // The partial unique index fired — someone took the slot between the
    // availability fetch and this submit.
    if (bookingError.code === "23505") {
      // Remove the orphan lead row so the dashboard stays clean.
      await supabase.from("demo_requests").delete().eq("id", requestRow.id);
      return {
        ok: false,
        code: "slot_taken",
        message: "Someone just took that slot. Please pick another time.",
      };
    }
    throw bookingError;
  }

  return {
    ok: true,
    booking: mapBooking(bookingRow),
    leadScore: score.score,
    leadTier: score.tier,
  };
}

export async function listBookings(): Promise<DemoBooking[]> {
  const { data, error } = await createSiteClient()
    .from("demo_bookings")
    .select("*")
    .order("slot_start", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<void> {
  const { error } = await createSiteClient()
    .from("demo_bookings")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

type BookingRow = Database["public"]["Tables"]["demo_bookings"]["Row"];

function mapBooking(row: BookingRow): DemoBooking {
  return {
    id: row.id,
    demo_request_id: row.demo_request_id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    message: row.message,
    slot_start: row.slot_start,
    duration_minutes: row.duration_minutes,
    status: row.status as BookingStatus,
    created_at: row.created_at,
  };
}
