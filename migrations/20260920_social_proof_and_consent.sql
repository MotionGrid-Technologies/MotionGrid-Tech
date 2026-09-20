-- Migration: Reviews (social proof) + enquiry consent flag
-- Project: MotionGrid (SITE_SUPABASE_*).
--
--   Phase 2 — admin-managed testimonials: public.reviews powers the homepage
--   testimonials strip, the /testimonials page, and the admin "Reviews" page.
--   Reviews are added/approved/rejected by admins via the service role (RLS
--   enabled with no permissive policies, same pattern as demo_requests).
--
--   Phase 1 — POPIA basics: demo_requests gains a consent_given flag recorded
--   when a visitor submits the enquiry forms (single consent checkbox).

-- Drift guard: this project inherited a legacy `reviews` table (author/source
-- columns, fabricated seed rows) from the archived Autofield schema. Per the
-- "no seed reviews" brief it is dropped and recreated with the MotionGrid
-- shape so the admin console owns a clean, empty reviews table.
DROP TABLE IF EXISTS public.reviews;

CREATE TABLE IF NOT EXISTS public.reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT '',
    company     TEXT NOT NULL DEFAULT '',
    quote       TEXT NOT NULL,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

ALTER TABLE public.demo_requests
    ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false;