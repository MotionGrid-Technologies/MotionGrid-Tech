-- Migration: MotionGrid lead capture (demo requests + PayFast payments)
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- These tables replace the local SQLite store (lib/db.ts) that could not run on
-- Vercel's read-only serverless filesystem. They are MotionGrid's own marketing
-- leads, so there is no workshop_id / tenant column.
--
-- Access is server-only: the public contact form's Server Action inserts via
-- the service role, and the admin dashboard reads via the service role. RLS is
-- enabled with no permissive policies, so anonymous/authenticated clients
-- (which share the public anon key) can never read or write these rows; only
-- the service role (which bypasses RLS) can. Add explicit policies here if a
-- Supabase-auth admin role is introduced later.

-- ═══════════════════════════════════════════════════════════════
-- Demo requests (contact / "Book a demo" form)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.demo_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    company     TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL DEFAULT '',
    message     TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON public.demo_requests(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- PayFast payments (read-only feed until the ITN webhook is wired)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payfast_payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pf_payment_id  TEXT NOT NULL DEFAULT '',
    item_name      TEXT NOT NULL DEFAULT '',
    name_first     TEXT NOT NULL DEFAULT '',
    name_last      TEXT NOT NULL DEFAULT '',
    email_address  TEXT NOT NULL DEFAULT '',
    amount_gross   NUMERIC NOT NULL DEFAULT 0,
    amount_fee     NUMERIC NOT NULL DEFAULT 0,
    amount_net     NUMERIC NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'ZAR',
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'failed', 'cancelled')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payfast_payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payfast_payments_created_at ON public.payfast_payments(created_at DESC);
