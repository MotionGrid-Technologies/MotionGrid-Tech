import test from 'node:test'
import assert from 'node:assert/strict'
import { getRoleFromJWT } from '../lib/role.ts'

test('an unverified cookie payload cannot grant super-admin access', () => {
  const forgedPayload = Buffer.from(
    JSON.stringify({ app_metadata: { role: 'super_admin' } }),
  ).toString('base64url')
  const forgedSession = { access_token: `header.${forgedPayload}.signature` }

  assert.equal(
    getRoleFromJWT(
      forgedSession as unknown as Parameters<typeof getRoleFromJWT>[0],
    ),
    'client',
  )
})

test('a verified Supabase identity can supply the super-admin role', () => {
  assert.equal(
    getRoleFromJWT({ app_metadata: { role: 'super_admin' } }),
    'super_admin',
  )
})
