-- Migration: MotionGrid marketing email logs
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- Records every marketing/lead email attempt (contact form admin notification,
-- demo confirmation auto-responder) so delivery failures can be audited and
-- retried. Mirrors the Autofield `email_logs` table but lives in MotionGrid's
-- own database, so marketing emails are never mixed with workshop emails.
--
-- Access is server-only via the service role (same pattern as `demo_requests`
-- and `payfast_payments`). RLS is enabled with no permissive policies, so
-- anonymous/authenticated clients can never read or write these rows.

CREATE TABLE IF NOT EXISTS public.email_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id    UUID,          -- nullable; unused for MotionGrid marketing emails
    template_key   TEXT NOT NULL DEFAULT '',
    to_email       TEXT NOT NULL,
    from_display   TEXT,
    subject        TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    error_message  TEXT,
    metadata       JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
