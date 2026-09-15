-- Migration: MotionGrid clients + meetings RLS.
-- Depends on: 20260909_motiongrid_auth_profiles.sql (role hook),
--             20260910_motiongrid_create_clients.sql,
--             20260910_motiongrid_create_meetings.sql
--
-- Public users must NOT write directly to these tables.
-- Public booking goes through a protected server-side action
-- (lib/meetings-store.ts, service role).

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CLIENTS
-- =========================================================

DROP POLICY IF EXISTS "Admins can view clients" ON public.clients;
CREATE POLICY "Admins can view clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
CREATE POLICY "Admins can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;
CREATE POLICY "Admins can update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;
CREATE POLICY "Admins can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- =========================================================
-- MEETINGS
-- =========================================================

DROP POLICY IF EXISTS "Admins can view meetings" ON public.meetings;
CREATE POLICY "Admins can view meetings"
ON public.meetings
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can insert meetings" ON public.meetings;
CREATE POLICY "Admins can insert meetings"
ON public.meetings
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can update meetings" ON public.meetings;
CREATE POLICY "Admins can update meetings"
ON public.meetings
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Admins can delete meetings" ON public.meetings;
CREATE POLICY "Admins can delete meetings"
ON public.meetings
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
);
