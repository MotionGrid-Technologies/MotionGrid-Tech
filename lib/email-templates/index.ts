/**
 * Email templates — MotionGrid.
 *
 * Structure:
 *   lib/email-templates/
 *     ├── index.ts          ← barrel (this file)
 *     ├── types.ts          ← shared interfaces
 *     ├── helpers.ts        ← renderTemplate, escapeHtml, getDefaultTemplate, buildTemplateEmail
 *     ├── contact.ts        ← contact_form
 *     └── marketing.ts      ← contact_form_submission, demo_request_confirmation
 */

import type { TemplateDef, TemplatePayload } from './types'
import { CONTACT_TEMPLATES } from './contact'
import { MARKETING_TEMPLATES } from './marketing'

export type { TemplateDef, TemplatePayload }

export { renderTemplate, getDefaultTemplate, buildTemplateEmail } from './helpers'

export const DEFAULT_TEMPLATES: Record<string, TemplateDef> = {
  ...CONTACT_TEMPLATES,
  ...MARKETING_TEMPLATES,
}