-- Migration: MotionGrid marketing emails (Tiptap editor drafts)
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- Stores marketing email templates drafted in the Tiptap editor under
-- /dashboard/admin/marketing/emails. v1 scope is drafting, previewing, saving,
-- and single test sends — no list broadcasting.
--
-- Access is server-only via the service role (same pattern as demo_requests /
-- email_logs). RLS is enabled with no permissive policies.

CREATE TABLE IF NOT EXISTS public.marketing_emails (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,               -- internal label
    subject     TEXT NOT NULL,
    html_body   TEXT NOT NULL,               -- Tiptap HTML output
    text_body   TEXT,
    status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketing_emails ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marketing_emails_status ON public.marketing_emails(status);
CREATE INDEX IF NOT EXISTS idx_marketing_emails_created_at ON public.marketing_emails(created_at DESC);
