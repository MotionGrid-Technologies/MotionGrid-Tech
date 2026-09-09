import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// Server-side MotionGrid Supabase client for Server Components and Server
// Actions. Uses cookie-based session — RLS enforces row access automatically.
// MotionGrid is the single project this repo talks to (SITE_SUPABASE_*).
export async function createSiteSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SITE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax' as const,
              });
            });
          } catch {
            // Called from a Server Component — cookie setting is handled by proxy.
          }
        },
      },
    }
  );
}

export { getRoleFromJWT } from './role';