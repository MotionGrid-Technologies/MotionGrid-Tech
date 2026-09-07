// Pure JWT role extraction. Safe for both Node.js and the Edge Runtime
// (middleware) — relies only on the standard `atob` global and JSON parsing.

/**
 * Extract the user's role from the JWT access token.
 * The custom-access-token Auth Hook injects `app_metadata.role` and
 * `app_metadata.workshop_id` into every issued JWT.
 */
export function getRoleFromJWT(
  session: { access_token?: string } | null | undefined,
): string {
  if (!session?.access_token) return 'client'
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]))
    return payload?.app_metadata?.role ?? 'client'
  } catch {
    return 'client'
  }
}
