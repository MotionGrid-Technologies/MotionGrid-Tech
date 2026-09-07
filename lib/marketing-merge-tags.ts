// Shared merge-tag definitions for MotionGrid marketing emails.
// Used by the Tiptap editor UI, the iframe preview, and the test-send route.
// Importable from both client and server components (no server-only imports).

export interface MergeTag {
  key: string
  label: string
  token: string
}

export const MARKETING_MERGE_TAGS: MergeTag[] = [
  { key: 'first_name', label: 'First name', token: '{{first_name}}' },
  { key: 'last_name', label: 'Last name', token: '{{last_name}}' },
  { key: 'email', label: 'Email', token: '{{email}}' },
  { key: 'company', label: 'Company', token: '{{company}}' },
  { key: 'unsubscribe_url', label: 'Unsubscribe URL', token: '{{unsubscribe_url}}' },
]

export const SAMPLE_MERGE_DATA: Record<string, string> = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  company: 'Acme Industries',
  unsubscribe_url: 'https://motiongrid.co.za/unsubscribe',
}

export function renderMergeTags(
  source: string,
  data: Record<string, string> = SAMPLE_MERGE_DATA
): string {
  let result = source
  for (const tag of MARKETING_MERGE_TAGS) {
    result = result.replaceAll(tag.token, data[tag.key] ?? '')
  }
  return result
}
