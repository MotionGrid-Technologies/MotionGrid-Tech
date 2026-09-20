import { NextResponse } from "next/server";
import { sendDueSequenceEmails } from "@/lib/email-sequences";

// Cron entrypoint for the welcome email sequence (TODO Phase 5). Any
// scheduler (Vercel Cron, GitHub Actions, a plain crontab with curl) may
// call this as often as it likes — due-ness is `next_send_at <= now()`.
//
// Auth: the caller must send the CRON_SECRET in the Authorization header:
//   Authorization: Bearer $CRON_SECRET
//
// Suggested schedule: hourly.

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDueSequenceEmails();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/email-sequences] failed", error);
    return NextResponse.json({ error: "Sequence run failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
