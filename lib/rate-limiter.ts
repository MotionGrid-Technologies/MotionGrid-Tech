import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Fixed-window rate limiter backed by MotionGrid's shared Supabase Postgres.
 * The check_rate_limit RPC performs its increment and rollover atomically, so
 * limits remain consistent across server instances and cold starts.
 */

const SITE_SUPABASE_URL = process.env.SITE_SUPABASE_URL
const SITE_SUPABASE_SERVICE_ROLE_KEY = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY

function createRateLimitClient() {
  if (!SITE_SUPABASE_URL || !SITE_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Rate limiting is not configured. Set SITE_SUPABASE_URL and ' +
        'SITE_SUPABASE_SERVICE_ROLE_KEY in the environment.'
    )
  }

  return createClient<Database>(SITE_SUPABASE_URL, SITE_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

/**
 * Extract the client IP from a standard Headers object (works for both API
 * routes and Server Actions). On Vercel, x-forwarded-for is set by the edge
 * network and is trustworthy; on other platforms it can be spoofed by clients.
 */
export function getClientIpFromHeaders(headersList: Headers): string {
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = headersList.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export function getClientIp(req: NextRequest): string {
  const ip = getClientIpFromHeaders(req.headers)
  if (ip !== 'unknown') return ip
  return (req as unknown as { ip?: string }).ip ?? 'unknown'
}

interface RateLimitOptions {
  maxRequests?: number   // tokens per window (default: 5)
  windowMs?: number      // window size in ms (default: 60000 = 1 min)
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
  const { maxRequests = 5, windowMs = 60_000 } = options
  const { data, error } = await createRateLimitClient().rpc('check_rate_limit', {
    p_identifier: identifier,
    p_max_requests: maxRequests,
    p_window_ms: windowMs,
  })

  if (error) throw error
  const result = data?.[0]
  if (!result) throw new Error('Rate limiter returned no result')

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetMs: result.reset_ms,
  }
}
