-- Migration: Public page SEO overrides
-- Project: MotionGrid (SITE_SUPABASE_*).
--
-- Lets admins override the metadata (title / description / keywords) of any
-- public route from the SEO dashboard. Public pages merge these overrides in
-- their generateMetadata. RLS enabled with no permissive policies (service
-- role only), the same pattern as reviews and demo_requests.

CREATE TABLE IF NOT EXISTS public.page_seo (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path             TEXT NOT NULL UNIQUE,
    meta_title       TEXT,
    meta_description TEXT,
    meta_keywords    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_page_seo_path ON public.page_seo(path);