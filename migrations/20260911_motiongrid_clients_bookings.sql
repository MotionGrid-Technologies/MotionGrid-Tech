-- Migration: MotionGrid clients, subscriptions, demo bookings, email sequences
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- Unlocks:
--   Phase 3  — clients table (client-portal groundwork) + 15-min slot booking
--   Phase 4/6 — subscriptions table (MRR/churn analytics + client-app kill switch)
--   Phase 5  — welcome email sequence enrollments
--   Phase 8  — lead scoring columns on demo_requests
--
-- Access is server-only via the service role (same pattern as demo_requests /
-- email_logs / marketing_emails). RLS is enabled with no permissive policies,
-- so anonymous/authenticated clients can never read or write these rows.

-- ═══════════════════════════════════════════════════════════════
-- Clients (Phase 3 groundwork — Supabase Auth client-portal records)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    domain          TEXT,
    project_status  TEXT NOT NULL DEFAULT 'prospect'
                    CHECK (project_status IN ('prospect', 'active', 'paused', 'offboarded')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clients_domain ON public.clients(domain);
CREATE INDEX IF NOT EXISTS idx_clients_project_status ON public.clients(project_status);

-- ═══════════════════════════════════════════════════════════════
-- Subscriptions (Phase 4/6 — billing + client "kill switch")
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    plan              TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'past_due', 'suspended', 'cancelled')),
    amount            NUMERIC NOT NULL DEFAULT 0,        -- monthly recurring amount
    currency          TEXT NOT NULL DEFAULT 'ZAR',
    next_billing_date DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ═══════════════════════════════════════════════════════════════
-- Demo bookings (Phase 3.3 — "pick a 15-min slot" flow)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.demo_bookings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_request_id  UUID REFERENCES public.demo_requests(id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    company          TEXT NOT NULL DEFAULT '',
    email            TEXT NOT NULL,
    phone            TEXT NOT NULL DEFAULT '',
    message          TEXT NOT NULL DEFAULT '',
    slot_start       TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes BETWEEN 15 AND 120),
    status           TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- One active booking per slot: partial unique index on scheduled bookings.
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_bookings_active_slot
    ON public.demo_bookings(slot_start)
    WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_demo_bookings_slot_start ON public.demo_bookings(slot_start);

-- ═══════════════════════════════════════════════════════════════
-- Email sequence enrollments (Phase 5 — welcome sequence)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_sequence_enrollments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_key   TEXT NOT NULL,
    lead_email     TEXT NOT NULL,
    lead_name      TEXT NOT NULL DEFAULT '',
    current_step   INTEGER NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    next_send_at   TIMESTAMPTZ,
    enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sequence_unique_lead
    ON public.email_sequence_enrollments(sequence_key, lead_email)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_email_sequence_due
    ON public.email_sequence_enrollments(status, next_send_at);

-- ═══════════════════════════════════════════════════════════════
-- Lead scoring (Phase 8) — columns on demo_requests
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.demo_requests
    ADD COLUMN IF NOT EXISTS score INTEGER,
    ADD COLUMN IF NOT EXISTS score_tier TEXT CHECK (score_tier IN ('hot', 'warm', 'cold')),
    ADD COLUMN IF NOT EXISTS score_breakdown JSONB;
