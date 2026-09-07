export type UserRole = 'client' | 'admin' | 'super_admin'

type VerifiedIdentity = {
  app_metadata?: Record<string, unknown> | null
}

/**
 * Read a role only from an identity already verified by Supabase through
 * auth.getUser() or auth.getClaims(). Raw session tokens are deliberately not
 * accepted here because their payloads are only cookie data until verified.
 */
export function getRoleFromJWT(
  identity: VerifiedIdentity | null | undefined,
): UserRole {
  const role = identity?.app_metadata?.role
  return role === 'admin' || role === 'super_admin' ? role : 'client'
}
