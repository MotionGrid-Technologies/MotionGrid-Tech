-- Migration: MotionGrid blog
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- Blog content model: authors, hierarchical categories (parent/child), posts,
-- post↔category assignment, and unique view tracking for the "Popular blogs"
-- section.
--
-- Access is server-only via the service role (same pattern as demo_requests /
-- email_logs / marketing_emails). RLS is enabled with no permissive policies,
-- so anonymous/authenticated clients can never read or write these rows.

-- ═══════════════════════════════════════════════════════════════
-- Authors
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_authors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    image_url   TEXT,
    bio         TEXT,
    is_default  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- Categories (parent/child hierarchy via self-referencing parent_id)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    parent_id   UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON public.blog_categories(parent_id);

-- ═══════════════════════════════════════════════════════════════
-- Posts
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    excerpt             TEXT,
    content             TEXT NOT NULL DEFAULT '',
    featured_image_url  TEXT,
    featured_image_alt  TEXT,
    author_id           UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL,
    meta_title          TEXT,
    meta_description    TEXT,
    status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at        TIMESTAMPTZ,
    view_count          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
    ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count
    ON public.blog_posts(view_count DESC);

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_blog_posts_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- Post ↔ Category assignment (many-to-many)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
    post_id      UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id  UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category
    ON public.blog_post_categories(category_id);

-- ═══════════════════════════════════════════════════════════════
-- Unique view tracking (24h dedup by viewer hash)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blog_views (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id      UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    viewer_hash  TEXT NOT NULL,
    viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_views_post_hash
    ON public.blog_views(post_id, viewer_hash, viewed_at);

-- ═══════════════════════════════════════════════════════════════
-- Seeds
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.blog_authors (name, is_default)
VALUES ('Motion Grid Team', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.blog_categories (name, slug, parent_id) VALUES
    ('Engineering', 'engineering', NULL),
    ('Product', 'product', NULL),
    ('Design', 'design', NULL),
    ('Company News', 'company-news', NULL)
ON CONFLICT (slug) DO NOTHING;
