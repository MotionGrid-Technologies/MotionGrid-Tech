import { createSiteSupabaseServiceClient } from "@/lib/site-supabase-service";
import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";
import { buildClientSlug } from "@/lib/clients-store";

// ---------------------------------------------------------------------------
// MotionGrid meetings store — the 15-minute booking calendar.
//
// Public booking (slot availability + create) runs through the service-role
// client inside a rate-limited, Turnstile-protected server action: RLS on
// clients/meetings is admin-only, so public users can never write directly.
// Admin reads/updates use the cookie-based client.
//
// All slot maths assume SAST (UTC+2, no daylight saving in South Africa).
// ---------------------------------------------------------------------------

export const SLOT_MINUTES = 15;
export const SLOT_LEAD_MINUTES = 60; // earliest bookable slot is 1h from now
export const BOOKING_WINDOW_DAYS = 14; // how far ahead slots are offered

const SAST_OFFSET = "+02:00";
const WORKDAY_START_HOUR = 9; // 09:00 SAST
const WORKDAY_END_HOUR = 17; // last slot starts 16:45, ends 17:00

export interface BookableDay {
  iso: string; // YYYY-MM-DD
  weekday: string; // Mon
  dayNumber: number; // 16
  month: string; // Sep
}

export interface BookableSlot {
  iso: string; // full timestamp, e.g. 2026-09-16T09:30:00+02:00
  label: string; // 09:30
}

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface MeetingRecord {
  id: string;
  scheduled_at: string;
  status: MeetingStatus;
  business_problem: string | null;
  preparation_notes: string | null;
  created_at: string;
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string | null;
  } | null;
}

// Raised when two people race for the same slot — the unique partial index
// on meetings(scheduled_at) where status='scheduled' rejects the second write.
export class SlotTakenError extends Error {
  constructor() {
    super("That slot was just booked by someone else. Please pick another.");
  }
}

// ---------------------------------------------------------------------------
// Slot maths (pure, SAST-fixed)
// ---------------------------------------------------------------------------

function isValidDateISO(dateISO: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return false;
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function isWeekend(dateISO: string): boolean {
  const [y, m, d] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun, 6=Sat
  return weekday === 0 || weekday === 6;
}

function addDaysToISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function todaySAST(): string {
  // Current date in SAST as YYYY-MM-DD (SAST = UTC+2, fixed).
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function slotISOsForDate(dateISO: string): string[] {
  const slots: string[] = [];
  for (let hour = WORKDAY_START_HOUR; hour < WORKDAY_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      slots.push(`${dateISO}T${hh}:${mm}:00${SAST_OFFSET}`);
    }
  }
  return slots;
}

function slotLabel(iso: string): string {
  return iso.slice(11, 16); // HH:mm
}

export function formatSlotLabel(iso: string): string {
  const formatted = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(iso));
  return `${formatted} (SAST)`;
}

// ---------------------------------------------------------------------------
// Public availability (service role — read-only on meetings)
// ---------------------------------------------------------------------------

export async function listBookableDays(count = 10): Promise<BookableDay[]> {
  const days: BookableDay[] = [];
  const lastDay = addDaysToISO(todaySAST(), BOOKING_WINDOW_DAYS - 1);

  let cursor = todaySAST();
  while (days.length < count && cursor <= lastDay) {
    if (!isWeekend(cursor)) {
      const [y, m, d] = cursor.split("-").map(Number);
      days.push({
        iso: cursor,
        weekday: new Intl.DateTimeFormat("en-ZA", {
          weekday: "short",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(y, m - 1, d))),
        dayNumber: d,
        month: new Intl.DateTimeFormat("en-ZA", {
          month: "short",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(y, m - 1, d))),
      });
    }
    cursor = addDaysToISO(cursor, 1);
  }

  return days;
}

export async function getBookableSlots(dateISO: string): Promise<BookableSlot[]> {
  if (!isValidDateISO(dateISO) || isWeekend(dateISO)) return [];

  const today = todaySAST();
  if (dateISO < today) return [];
  if (dateISO > addDaysToISO(today, BOOKING_WINDOW_DAYS - 1)) return [];

  const earliest = Date.now() + SLOT_LEAD_MINUTES * 60 * 1000;
  const candidates = slotISOsForDate(dateISO).filter((iso) => Date.parse(iso) > earliest);
  if (candidates.length === 0) return [];

  const supabase = createSiteSupabaseServiceClient();

  const dayStart = `${dateISO}T00:00:00${SAST_OFFSET}`;
  const dayEnd = `${dateISO}T23:59:59${SAST_OFFSET}`;

  const { data, error } = await supabase
    .from("meetings")
    .select("scheduled_at")
    .eq("status", "scheduled")
    .gte("scheduled_at", dayStart)
    .lte("scheduled_at", dayEnd);

  if (error) throw error;

  const taken = new Set((data ?? []).map((row) => row.scheduled_at));

  return candidates
    .filter((iso) => !taken.has(iso))
    .map((iso) => ({ iso, label: slotLabel(iso) }));
}

// ---------------------------------------------------------------------------
// Public booking (service role — constrained writes)
// ---------------------------------------------------------------------------

export async function createMeetingBooking(input: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  slot: string;
  notes?: string;
}): Promise<{ meetingId: string; scheduledAt: string }> {
  // Re-validate the slot exactly as getBookableSlots computed it: correct
  // shape, a weekday inside the window, and within working hours.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+02:00$/.test(input.slot)) {
    throw new Error("Invalid slot.");
  }
  const dateISO = input.slot.slice(0, 10);
  const available = await getBookableSlots(dateISO);
  if (!available.some((s) => s.iso === input.slot)) {
    throw new SlotTakenError();
  }

  const supabase = createSiteSupabaseServiceClient();
  const email = input.email.trim().toLowerCase();

  // Find-or-create the client by email (public booking has no session).
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let clientId = existing?.id ?? null;

  if (!clientId) {
    const slug = buildClientSlug(input.company, input.name);
    const { data: slugTaken } = await supabase
      .from("clients")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const { data: created, error: createError } = await supabase
      .from("clients")
      .insert({
        name: input.name,
        company: input.company || input.name,
        email,
        phone: input.phone || null,
        slug: slugTaken ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug,
      })
      .select("id")
      .single();

    if (createError) throw createError;
    clientId = created.id;
  }

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      client_id: clientId,
      scheduled_at: input.slot,
      business_problem: input.notes || null,
      status: "scheduled",
    })
    .select("id, scheduled_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new SlotTakenError();
    throw error;
  }

  return { meetingId: meeting.id, scheduledAt: meeting.scheduled_at };
}

// ---------------------------------------------------------------------------
// Admin (cookie client — RLS admin-only policies apply)
// ---------------------------------------------------------------------------

export async function listMeetings(): Promise<MeetingRecord[]> {
  const supabase = await createSiteSupabaseServerClient();

  const { data, error } = await supabase
    .from("meetings")
    .select(
      "id, scheduled_at, status, business_problem, preparation_notes, created_at, client:clients(id, name, company, email, phone)"
    )
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as MeetingRecord[];
}

export async function setMeetingStatus(id: string, status: MeetingStatus): Promise<void> {
  const supabase = await createSiteSupabaseServerClient();
  const { error } = await supabase.from("meetings").update({ status }).eq("id", id);
  if (error) throw error;
}
