import { NextRequest } from 'next/server'

/**
 * In-memory token bucket rate limiter.
 * Tracks requests per identifier (usually an IP) within a time window.
 * No external dependencies — pure Node.js Map.
 *
 * Note: state is process-local, so limits are per-serverless-instance rather
 * than globally shared. Acceptable for the current traffic; move to Redis or
 * Vercel KV for cross-instance enforcement later if needed.
 */

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

interface Bucket {
  tokens: number
  lastRefill: number
}

const store = new Map<string, Bucket>()

interface RateLimitOptions {
  maxRequests?: number   // tokens per window (default: 5)
  windowMs?: number      // window size in ms (default: 60000 = 1 min)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetMs: number } {
  const { maxRequests = 5, windowMs = 60_000 } = options
  const now = Date.now()

  const bucket = store.get(identifier)

  if (!bucket) {
    store.set(identifier, { tokens: maxRequests - 1, lastRefill: now })
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs }
  }

  const elapsed = now - bucket.lastRefill
  const tokensToAdd = Math.floor(elapsed / windowMs) * maxRequests

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, maxRequests)
    bucket.lastRefill = now
  }

  // Time until the next refill boundary. When a refill just occurred, that is
  // a full window from now; otherwise it is the remainder of the current one.
  const resetMs = tokensToAdd > 0 ? windowMs : windowMs - (elapsed % windowMs)

  if (bucket.tokens > 0) {
    bucket.tokens -= 1
    return { allowed: true, remaining: bucket.tokens, resetMs }
  }

  return { allowed: false, remaining: 0, resetMs }
}

/** Clean up expired entries periodically (memory optimization). */
export function cleanupRateLimitStore(maxAgeMs: number = 5 * 60_000): void {
  const now = Date.now()
  for (const [key, bucket] of store.entries()) {
    if (now - bucket.lastRefill > maxAgeMs) {
      store.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => cleanupRateLimitStore(), 5 * 60_000)
