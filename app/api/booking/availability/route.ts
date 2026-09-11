import { NextResponse } from "next/server";
import {
  generateSlotsForSastDate,
  isValidSastDateKey,
} from "@/lib/booking-slots";
import { getBookedSlotsForSastDate } from "@/lib/booking-store";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limiter";

// Public availability feed for the contact page slot picker. Returns the
// offerable 15-minute slots for one SAST date, minus already-scheduled ones.
// The slot grid itself is generated server-side (lib/booking-slots.ts) so a
// client can never propose an off-grid time that the booking action would
// then have to reject.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";

  // Light rate limit: 30 lookups per IP per minute (a picker hits this once
  // per date the visitor tabs through).
  const ip = getClientIpFromHeaders(request.headers);
  const { allowed } = await checkRateLimit(`availability:${ip}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isValidSastDateKey(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const offered = generateSlotsForSastDate(date);
    const booked = await getBookedSlotsForSastDate(date);
    const bookedSet = new Set(booked);

    return NextResponse.json({
      date,
      slots: offered.filter((iso) => !bookedSet.has(iso)),
    });
  } catch (error) {
    console.error("[availability] failed", error);
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
