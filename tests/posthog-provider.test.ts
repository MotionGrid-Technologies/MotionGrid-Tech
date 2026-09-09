import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPostHogPageviewUrl } from '../lib/posthog-pageview.ts'

test('does not capture protected admin URLs', () => {
  const url = buildPostHogPageviewUrl(
    'https://motiongrid.co.za',
    '/dashboard/admin/dashboard',
    new URLSearchParams('workshopId=secret&new=true'),
  )

  assert.equal(url, null)
})

test('retains only normalized public query parameters', () => {
  const url = buildPostHogPageviewUrl(
    'https://motiongrid.co.za',
    '/blog',
    new URLSearchParams(
      'category=engineering&page=2&workshopId=secret&new=true&email=user@example.com',
    ),
  )

  assert.equal(url, 'https://motiongrid.co.za/blog?category=engineering&page=2')
})

test('drops malformed values even for allow-listed keys', () => {
  const url = buildPostHogPageviewUrl(
    'https://motiongrid.co.za',
    '/blog',
    new URLSearchParams('category=private%20value&page=-1'),
  )

  assert.equal(url, 'https://motiongrid.co.za/blog')
})
