import { NextResponse } from 'next/server'
import { createSiteSupabaseServerClient, getRoleFromJWT } from '@/lib/siteSupabaseServer'
import { checkRateLimit, getClientIpFromHeaders } from '@/lib/rate-limiter'

type AdminRole = 'admin' | 'super_admin'

async function isRateLimited(request: Request): Promise<boolean> {
  const ip = getClientIpFromHeaders(request.headers)
  const { allowed } = await checkRateLimit(`admin:${ip}`, {
    maxRequests: 30,
    windowMs: 60_000,
  })
  return !allowed
}

async function getAuthorizedRole(): Promise<ReturnType<typeof getRoleFromJWT> | null> {
  const supabase = await createSiteSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  return error || !data?.claims ? null : getRoleFromJWT(data.claims)
}

export async function guardAdminRequest(
  request: Request,
  requiredRole: AdminRole = 'admin',
): Promise<NextResponse | null> {
  if (await isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const role = await getAuthorizedRole()
  const authorized =
    requiredRole === 'super_admin'
      ? role === 'super_admin'
      : role === 'admin' || role === 'super_admin'

  return authorized
    ? null
    : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
