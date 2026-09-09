-- Migration: MotionGrid auth profiles + JWT role hook + auto-RLS
-- Project: MotionGrid (SITE_SUPABASE_*) — NOT the Autofield multi-tenant project.
--
-- Captures the objects that already exist in the live MotionGrid database but
-- were created outside the migration workflow:
--   1. public.profiles — one-to-one with auth.users, holds the user's role
--   2. public.custom_access_token_hook — Auth Hook that injects
--      app_metadata.role into JWTs from public.profiles.role (wired in the
--      Supabase Auth dashboard as the "Custom Access Token" database hook).
--   3. public.rls_auto_enable + ensure_rls event trigger — safety net that
--      enables RLS on any new table created in public.
--
-- Idempotent: safe to run multiple times.

-- ═══════════════════════════════════════════════════════════════
-- Profiles (one-to-one with auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    role        TEXT NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'admin', 'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supabase Auth admin needs read access to resolve roles.
DROP POLICY IF EXISTS "Auth admin can read profiles" ON public.profiles;
CREATE POLICY "Auth admin can read profiles" ON public.profiles
FOR SELECT TO supabase_auth_admin USING (true);

-- Super admins can update any profile's role.
DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
CREATE POLICY "Super admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'super_admin'::text)
WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'super_admin'::text);

-- Super admins can view all profiles.
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'super_admin'::text);

-- Users can view their own profile.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════
-- Custom Access Token Hook — injects app_metadata.role from profiles
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role
  INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(
      claims,
      '{app_metadata,role}',
      to_jsonb(user_role),
      true
    );
  END IF;

  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$function$;

-- ═══════════════════════════════════════════════════════════════
-- rls_auto_enable — enables RLS on any new table created in public
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
       AND cmd.schema_name IN ('public')
       AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
       AND cmd.schema_name NOT LIKE 'pg_toast%'
       AND cmd.schema_name NOT LIKE 'pg_temp%'
    THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
    END IF;
  END LOOP;
END;
$function$;

DROP EVENT TRIGGER IF EXISTS ensure_rls;
CREATE EVENT TRIGGER ensure_rls
    ON ddl_command_end
    EXECUTE FUNCTION public.rls_auto_enable();