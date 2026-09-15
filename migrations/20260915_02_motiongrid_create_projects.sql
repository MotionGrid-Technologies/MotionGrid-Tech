-- Migration: MotionGrid projects (one per approved proposal).
-- Depends on: 20260915_01_motiongrid_create_proposals.sql

CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id uuid NOT NULL
        REFERENCES public.clients(id)
        ON DELETE CASCADE,

    proposal_id uuid UNIQUE
        REFERENCES public.proposals(id)
        ON DELETE SET NULL,

    name text NOT NULL,

    description text,

    status text NOT NULL DEFAULT 'planning'
        CHECK (
            status IN (
                'planning',
                'active',
                'completed',
                'cancelled'
            )
        ),

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_client_id_idx
ON public.projects(client_id);

CREATE INDEX IF NOT EXISTS projects_status_idx
ON public.projects(status);

-- ═══════════════════════════════════════════════════════════════
-- RLS — admins/super_admins manage everything. Public visitors never
-- touch this table directly.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects" ON public.projects
    FOR ALL TO authenticated
    USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) IN ('admin', 'super_admin'))
    WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) IN ('admin', 'super_admin'));