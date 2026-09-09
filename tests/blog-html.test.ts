import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeBlogHtml } from '../lib/blog-html.ts'

test('removes executable markup while preserving editor content', () => {
  const html = sanitizeBlogHtml(
    '<h2>Safe heading</h2><img src="x" onerror="alert(1)"><script>alert(1)</script>',
  )

  assert.equal(html, '<h2>Safe heading</h2><img src="x">')
})
