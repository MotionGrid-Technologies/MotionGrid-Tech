// ---------------------------------------------------------------------------
// Demo slot logic (TODO Phase 3.3 — "pick a 15-min slot" flow).
//
// Pure functions, no I/O — the authoritative slot grid lives here and is used
// by BOTH the availability API (to offer slots) and the booking action (to
// validate a chosen slot server-side).
//
// Business hours: Mon-Fri, 09:00-16:00 South Africa (SAST = UTC+2, no DST).
// Slots: 15 minutes, on the quarter-hour. Bookable window: next 30 days,
// at least 1 hour ahead.
// ---------------------------------------------------------------------------

export const SLOT_MINUTES = 15;
export const SLOT_LEAD_TIME_MINUTES = 60;
export const SLOT_WINDOW_DAYS = 30;

const SAST_OFFSET_MINUTES = 120; // UTC+2, no daylight saving in South Africa.
const WORKDAY_START_MINUTES = 9 * 60; // 09:00
const WORKDAY_END_MINUTES = 16 * 60; // 16:00 — last slot starts 15:45.

function sastParts(date: Date) {
  const shifted = new Date(date.getTime() + SAST_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  };
}

/** Convert SAST wall-clock (Y,M,D,h,m) to a UTC Date. */
function sastToUtc(year: number, month: number, day: number, hours: number, minutes: number): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, 0, 0) - SAST_OFFSET_MINUTES * 60_000
  );
}

/** "YYYY-MM-DD" in SAST for a given instant (used as the availability key). */
export function sastDateKey(date: Date): string {
  const p = sastParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** True when the SAST date string is a valid, bookable calendar date. */
export function isValidSastDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const utc = sastToUtc(y, m, d, 12, 0);
  return sastDateKey(utc) === key;
}

/**
 * Generate every offered slot for a SAST date, filtered for lead time.
 * Returns UTC ISO strings (what the client posts back verbatim).
 */
export function generateSlotsForSastDate(dateKey: string, now = new Date()): string[] {
  if (!isValidSastDateKey(dateKey)) return [];
  const [y, m, d] = dateKey.split("-").map(Number);

  // Sunday(0) / Saturday(6) are not bookable.
  const weekday = sastToUtc(y, m, d, 12, 0).getUTCDay();
  if (weekday === 0 || weekday === 6) return [];

  const slots: string[] = [];
  const earliest = now.getTime() + SLOT_LEAD_TIME_MINUTES * 60_000;

  for (let minutes = WORKDAY_START_MINUTES; minutes <= WORKDAY_END_MINUTES - SLOT_MINUTES; minutes += SLOT_MINUTES) {
    const start = sastToUtc(y, m, d, Math.floor(minutes / 60), minutes % 60);
    if (start.getTime() >= earliest) {
      slots.push(start.toISOString());
    }
  }
  return slots;
}

/**
 * Validate a submitted slot ISO string against the same grid rules.
 * Returns an error code, or null when the slot is legitimately offerable.
 */
export function validateSlot(slotIso: string, now = new Date()): string | null {
  let start: Date;
  try {
    start = new Date(slotIso);
  } catch {
    return "invalid";
  }
  if (Number.isNaN(start.getTime())) return "invalid";

  // Must be on the quarter-hour grid.
  if (start.getUTCSeconds() !== 0 || start.getUTCMilliseconds() !== 0 || start.getUTCMinutes() % SLOT_MINUTES !== 0) {
    return "not_on_grid";
  }

  const p = sastParts(start);

  // Weekday check (use the SAST wall-clock weekday).
  const noon = sastToUtc(p.year, p.month, p.day, 12, 0);
  const weekday = noon.getUTCDay();
  if (weekday === 0 || weekday === 6) return "not_workday";

  // Working hours in SAST wall-clock minutes.
  const wallMinutes = p.hours * 60 + p.minutes;
  if (wallMinutes < WORKDAY_START_MINUTES || wallMinutes + SLOT_MINUTES > WORKDAY_END_MINUTES) {
    return "outside_hours";
  }

  // Lead time + booking window.
  if (start.getTime() < now.getTime() + SLOT_LEAD_TIME_MINUTES * 60_000) return "too_soon";
  if (start.getTime() > now.getTime() + SLOT_WINDOW_DAYS * 24 * 60 * 60_000) return "too_far";

  return null;
}

/** Human-friendly SAST rendering used in emails + admin UI. */
export function formatSlotSast(start: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Johannesburg",
  }).format(start);
}

/** The next N bookable SAST date keys (skips weekends), starting today. */
export function nextBookableDateKeys(count: number, now = new Date()): string[] {
  const keys: string[] = [];
  let cursor = new Date(now.getTime() + SAST_OFFSET_MINUTES * 60_000);
  for (let i = 0; i < count + 4 && keys.length < count; i++) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) keys.push(key);
    cursor = new Date(cursor.getTime() + 24 * 60 * 60_000);
  }
  return keys;
}
