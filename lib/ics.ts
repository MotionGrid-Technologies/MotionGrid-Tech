// ---------------------------------------------------------------------------
// Minimal iCalendar (RFC 5545) invite generator for demo bookings.
//
// Produces a METHOD:REQUEST VEVENT so calendar clients (Google, Outlook,
// Apple) render it as an invitable meeting. Output uses CRLF line endings
// and folds long lines at 75 octets as required by the spec.
// ---------------------------------------------------------------------------

const CRLF = "\r\n";

/** Escape text properties per RFC 5545 (backslash, semicolon, comma, newline). */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");
}

/** Format a Date as an iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ. */
function icsUtcStamp(date: Date): string {
  return (
    date.getUTCFullYear().toString().padStart(4, "0") +
    (date.getUTCMonth() + 1).toString().padStart(2, "0") +
    date.getUTCDate().toString().padStart(2, "0") +
    "T" +
    date.getUTCHours().toString().padStart(2, "0") +
    date.getUTCMinutes().toString().padStart(2, "0") +
    date.getUTCSeconds().toString().padStart(2, "0") +
    "Z"
  );
}

/** Fold a logical line into <=75-octet physical lines (simple ASCII fold). */
function foldLine(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let remaining = line;
  // First chunk may carry 73 chars; continuations start with a space.
  parts.push(remaining.slice(0, 73));
  remaining = remaining.slice(73);
  while (remaining.length > 0) {
    parts.push(" " + remaining.slice(0, 72));
    remaining = remaining.slice(72);
  }
  return parts.join(CRLF);
}

export interface BuildBookingInviteParams {
  uid: string;
  start: Date;
  durationMinutes: number;
  summary: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
}

export function buildBookingInvite(params: BuildBookingInviteParams): string {
  const end = new Date(params.start.getTime() + params.durationMinutes * 60_000);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MotionGrid//Demo Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(params.uid)}`,
    `DTSTAMP:${icsUtcStamp(new Date())}`,
    `DTSTART:${icsUtcStamp(params.start)}`,
    `DTEND:${icsUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(params.summary)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    "LOCATION:Online (link confirmed by email)",
    "STATUS:CONFIRMED",
    `ORGANIZER;CN=${escapeIcsText(params.organizerName)}:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(params.attendeeName)};RSVP=TRUE:mailto:${params.attendeeEmail}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:MotionGrid demo call reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join(CRLF) + CRLF;
}

/** Base64 of the invite (for the Resend attachments payload). */
export function bookingInviteBase64(params: BuildBookingInviteParams): string {
  return Buffer.from(buildBookingInvite(params), "utf-8").toString("base64");
}
