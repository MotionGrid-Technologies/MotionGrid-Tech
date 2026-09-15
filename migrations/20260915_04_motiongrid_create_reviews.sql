-- Migration: MotionGrid reviews (client testimonials with admin approval).
-- Powers /testimonials (approved reviews only) and the admin moderation
-- queue at /dashboard/admin/reviews.
--
-- Depends on: 20260909_motiongrid_auth_profiles.sql (role hook).

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    author text NOT NULL,
    role text,
    company text,

    rating int NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    quote text NOT NULL,

    source text NOT NULL DEFAULT 'website'
        CHECK (source IN ('website', 'email', 'google', 'facebook', 'linkedin')),

    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_status_idx
ON public.reviews(status);

-- ═══════════════════════════════════════════════════════════════
-- RLS — admins moderate. The public /testimonials page reads via the
-- service-role client in a Server Component, so no anon policy needed.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews" ON public.reviews
    FOR ALL TO authenticated
    USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) IN ('admin', 'super_admin'))
    WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) IN ('admin', 'super_admin'));

-- ═══════════════════════════════════════════════════════════════
-- Seed data — realistic sample reviews across MotionGrid's active
-- industries so the moderation queue and /testimonials have content
-- on first run. Delete or edit freely from the admin dashboard.
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.reviews (author, role, company, rating, quote, source, status) VALUES
(
  'Thulani Ndlovu',
  'Owner',
  'Ndlovu Plumbing & Sons',
  5,
  'We ran six vans on paper job cards for years. MotionGrid built us a dispatch board our office manager actually enjoys using. Jobs get assigned before the coffee is cold, and nothing falls through the cracks anymore.',
  'google',
  'approved'
),
(
  'Alicia Fourie',
  'Fleet Manager',
  'Vantage Fleet Services',
  5,
  'Our maintenance schedule used to live in one very tired spreadsheet. Now every service, inspection, and license renewal is tracked per vehicle with reminders that actually reach us. The team understood fleet ops better than we expected.',
  'linkedin',
  'approved'
),
(
  'Sipho Khumalo',
  'Workshop Manager',
  'Khumalo Panel & Paint',
  4,
  'Quoting used to take us most of an afternoon. The estimate tool MotionGrid built pulls our parts and labour rates automatically, so a customer gets a professional PDF quote while they are still standing at the counter.',
  'facebook',
  'approved'
),
(
  'Rian van der Merwe',
  'Director',
  'Cape Aqua Plumbing',
  5,
  'From the first call to handover, everything was straight talk and clear timelines. The booking portal they built for us cut phone tag with customers down to almost nothing.',
  'email',
  'pending'
),
(
  'Naledi Mthembu',
  'Operations Lead',
  'QuickFix Maintenance Group',
  4,
  'What impressed me most was how they pushed back on features we did not need yet. The first version did one thing well instead of ten things badly. We have grown into the platform as our team grew.',
  'website',
  'pending'
),
(
  'Dumisani Sithole',
  'Owner',
  'Sithole Auto Body',
  3,
  'The software is solid now, but the first few weeks had a couple of rough edges and communication was slower than promised. They sorted it out in the end and the support has been good since.',
  'google',
  'pending'
),
(
  'Competitor Spam Account',
  NULL,
  'Best Websites 4U',
  1,
  'We build the same software for a quarter of the price, contact us at cheap-websites.example for a free quote today!',
  'website',
  'rejected'
);
