import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// Server-side Supabase client for Server Components and Server Actions
// Uses cookie-based session — RLS enforces tenant isolation automatically
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Called from a Server Component — cookie setting is handled by middleware
          }
        },
      },
    }
  );
}

// Service role client has been moved to lib/super-admin.ts.
// Use createSuperAdminClient() for auth-admin operations and
// server-side public-resource queries where RLS would block anonymous access.
// Always enforce authorization manually when using the service role client.
// All other user-facing queries should use createSupabaseServerClient().

export { getRoleFromJWT } from './role'