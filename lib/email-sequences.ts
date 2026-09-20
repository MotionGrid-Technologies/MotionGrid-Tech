import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getDefaultTemplate, DEFAULT_TEMPLATES, renderTemplate } from "@/lib/email-templates";
import { sendMarketingEmail } from "@/lib/marketing-email";

// ---------------------------------------------------------------------------
// Welcome email sequence engine (TODO Phase 5 — "welcome email sequence for
// new leads").
//
// Sequences are defined in code; enrollments live in the
// `email_sequence_enrollments` table. Step 1 fires immediately at enrollment;
// later steps are released by `sendDueSequenceEmails()`, which the
// /api/cron/email-sequences route runs on a schedule (Vercel Cron / GH
// Actions / any scheduler that can carry the CRON_SECRET header).
//
// A lead is enrolled at most once per sequence (partial unique index on
// (sequence_key, lead_email) WHERE status='active').
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

// ── Sequence definitions ───────────────────────────────────────────────────

export interface SequenceStep {
  templateKey: string;
  /** Hours after the previous step (step 1 = 0, sent immediately). */
  delayHours: number;
}

export interface EmailSequence {
  key: string;
  steps: SequenceStep[];
}

export const WELCOME_SEQUENCE: EmailSequence = {
  key: "welcome",
  steps: [
    { templateKey: "welcome_email_1", delayHours: 0 },
    { templateKey: "welcome_email_2", delayHours: 48 },
    { templateKey: "welcome_email_3", delayHours: 120 },
  ],
};

const SEQUENCES: EmailSequence[] = [WELCOME_SEQUENCE];

// ── Enrollment ─────────────────────────────────────────────────────────────

export interface EnrollResult {
  enrolled: boolean;
  reason?: "already_active" | "sequence_not_found" | "send_failed";
}

/**
 * Enroll a lead and immediately send step 1. Idempotent: a lead already in
 * an active enrollment is left untouched (reason: already_active).
 */
export async function enrollLeadInSequence(
  sequenceKey: string,
  lead: { email: string; name: string }
): Promise<EnrollResult> {
  const sequence = SEQUENCES.find((s) => s.key === sequenceKey);
  if (!sequence) return { enrolled: false, reason: "sequence_not_found" };

  const supabase = createSiteClient();

  const { data: existing } = await supabase
    .from("email_sequence_enrollments")
    .select("id")
    .eq("sequence_key", sequenceKey)
    .eq("lead_email", lead.email)
    .eq("status", "active")
    .maybeSingle();

  if (existing) return { enrolled: false, reason: "already_active" };

  // Send step 1 before writing the enrollment — a lead that never got step 1
  // should not sit in the sequence.
  const step = sequence.steps[0];
  const sent = await sendStepEmail(step.templateKey, lead);
  if (!sent) return { enrolled: false, reason: "send_failed" };

  const next = sequence.steps[1];
  const nextSendAt = next
    ? new Date(Date.now() + next.delayHours * 60 * 60_000).toISOString()
    : null;

  const { error } = await supabase.from("email_sequence_enrollments").insert({
    sequence_key: sequenceKey,
    lead_email: lead.email,
    lead_name: lead.name,
    current_step: 1,
    status: next ? "active" : "completed",
    next_send_at: nextSendAt,
  });

  if (error) throw error;
  return { enrolled: true };
}

// ── Runner ─────────────────────────────────────────────────────────────────

export interface RunResult {
  checked: number;
  sent: number;
  completed: number;
  failures: number;
}

/**
 * Release every due step. Called by the cron route; safe to run as often as
 * the schedule likes — due-ness is `next_send_at <= now() AND status='active'`.
 */
export async function sendDueSequenceEmails(now = new Date()): Promise<RunResult> {
  const supabase = createSiteClient();
  const result: RunResult = { checked: 0, sent: 0, completed: 0, failures: 0 };

  const { data: due, error } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .order("next_send_at", { ascending: true })
    .limit(100);

  if (error) throw error;

  for (const row of due ?? []) {
    result.checked++;
    const sequence = SEQUENCES.find((s) => s.key === row.sequence_key);
    if (!sequence) {
      // Unknown sequence — cancel so it never blocks the queue.
      await supabase
        .from("email_sequence_enrollments")
        .update({ status: "cancelled", next_send_at: null, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      continue;
    }

    const nextStep = sequence.steps[row.current_step]; // 0-indexed next
    if (!nextStep) {
      await supabase
        .from("email_sequence_enrollments")
        .update({ status: "completed", next_send_at: null, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      result.completed++;
      continue;
    }

    const lead = { email: row.lead_email, name: row.lead_name };
    const sent = await sendStepEmail(nextStep.templateKey, lead);
    if (!sent) {
      result.failures++;
      // Retry in 6 hours rather than dropping the lead.
      await supabase
        .from("email_sequence_enrollments")
        .update({
          next_send_at: new Date(Date.now() + 6 * 60 * 60_000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      continue;
    }

    result.sent++;
    const following = sequence.steps[row.current_step + 1];
    await supabase
      .from("email_sequence_enrollments")
      .update({
        current_step: row.current_step + 1,
        status: following ? "active" : "completed",
        next_send_at: following
          ? new Date(Date.now() + following.delayHours * 60 * 60_000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (!following) result.completed++;
  }

  return result;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function businessName(): string {
  return process.env.EMAIL_DISPLAY_NAME || "Motion Grid";
}

async function sendStepEmail(
  templateKey: string,
  lead: { email: string; name: string }
): Promise<boolean> {
  const def = getDefaultTemplate(templateKey, DEFAULT_TEMPLATES);
  if (!def) {
    console.error(`[email-sequences] Missing template: ${templateKey}`);
    return false;
  }

  const variables = {
    name: lead.name,
    businessName: businessName(),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://motiongrid.co.za",
  };

  const res = await sendMarketingEmail({
    to: lead.email,
    subject: renderTemplate(def.subject, variables),
    html: renderTemplate(def.html, variables),
    text: renderTemplate(def.text, variables),
    templateKey,
    variables,
  });

  return res.success;
}
