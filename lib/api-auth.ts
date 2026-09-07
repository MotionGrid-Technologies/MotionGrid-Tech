import { createSupabaseServerClient, getRoleFromJWT } from '@/lib/supabaseServer'
import { checkRateLimit, getClientIpFromHeaders } from '@/lib/rate-limiter'

// Shared guards for admin API route handlers.

export function isRateLimited(request: Request): boolean {
  const ip = getClientIpFromHeaders(request.headers)
  const { allowed } = checkRateLimit(`admin:${ip}`, { maxRequests: 30, windowMs: 60_000 })
  return !allowed
}

export async function isAdminAuthorized(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const role = getRoleFromJWT(session)
  return role === 'admin' || role === 'super_admin'
}
