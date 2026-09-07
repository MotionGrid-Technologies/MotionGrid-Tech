import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'
import { renderTemplate, getDefaultTemplate, DEFAULT_TEMPLATES } from '@/lib/email-templates'

// ---------------------------------------------------------------------------
// MotionGrid marketing/lead email sender.
//
// Unlike lib/email.ts (which is Autofield/workshop-aware), this module is
// strictly for MotionGrid's own site emails — contact form admin notifications
// and demo confirmation auto-responders. It uses the env-based sender and
// logs every attempt to MotionGrid's own Supabase `email_logs` table.
// ---------------------------------------------------------------------------

const DEFAULT_FROM_EMAIL = 'hi@updates.motiongrid.co.za'
const DEFAULT_REPLY_TO = 'hi@motiongrid.co.za'
const DEFAULT_DISPLAY_NAME = 'Motion Grid'
const DEFAULT_ADMIN_EMAIL = 'hello@motiongrid.co.za'

function getFrom(): string {
  const displayName = process.env.EMAIL_DISPLAY_NAME || DEFAULT_DISPLAY_NAME
  const email = process.env.EMAIL_FROM || DEFAULT_FROM_EMAIL
  return `${displayName} <${email}>`
}

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    console.error('[marketing-email] RESEND_API_KEY is missing')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

function createSiteClient() {
  const url = process.env.SITE_SUPABASE_URL
  const key = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and ' +
        'SITE_SUPABASE_SERVICE_ROLE_KEY in the environment.'
    )
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

async function logEmail(params: {
  templateKey: string
  toEmail: string
  fromDisplay: string
  subject: string
  status: 'sent' | 'failed'
  errorMessage?: string
  metadata?: Json
}): Promise<void> {
  try {
    const supabase = createSiteClient()
    await supabase.from('email_logs').insert({
      template_key: params.templateKey,
      to_email: params.toEmail,
      from_display: params.fromDisplay,
      subject: params.subject,
      status: params.status,
      error_message: params.errorMessage ?? null,
      metadata: params.metadata ?? null,
    })
  } catch (err) {
    console.error('[marketing-email] Failed to log email:', err)
  }
}

export interface SendMarketingEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  templateKey: string
  variables?: Record<string, string>
}

export async function sendMarketingEmail(
  params: SendMarketingEmailParams
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const from = getFrom()

  let subject = params.subject
  let html = params.html
  let text = params.text || ''

  if (params.variables && Object.keys(params.variables).length > 0) {
    subject = renderTemplate(subject, params.variables)
    html = renderTemplate(html, params.variables)
    text = renderTemplate(text, params.variables)
  }

  try {
    const emailConfig: {
      from: string
      to: string
      subject: string
      html: string
      text?: string
      reply_to: string
    } = { from, to: params.to, subject, html, reply_to: DEFAULT_REPLY_TO }
    if (text) emailConfig.text = text

    const { data, error } = await getResend().emails.send(emailConfig)

    if (error) {
      await logEmail({
        templateKey: params.templateKey,
        toEmail: params.to,
        fromDisplay: from,
        subject,
        status: 'failed',
        errorMessage: error.message,
      })
      return { success: false, error: error.message }
    }

    await logEmail({
      templateKey: params.templateKey,
      toEmail: params.to,
      fromDisplay: from,
      subject,
      status: 'sent',
      metadata: { messageId: data?.id ?? null },
    })

    return { success: true, messageId: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[marketing-email] Send failed:', msg)
    await logEmail({
      templateKey: params.templateKey,
      toEmail: params.to,
      fromDisplay: from,
      subject,
      status: 'failed',
      errorMessage: msg,
    })
    return { success: false, error: msg }
  }
}

// ── Specific senders ──────────────────────────────────────────────

export interface ContactFormData {
  name: string
  company: string
  email: string
  phone: string
  message: string
}

export async function sendContactFormAdminNotification(data: ContactFormData) {
  const def = getDefaultTemplate('contact_form_submission', DEFAULT_TEMPLATES)
  if (!def) {
    console.error('[marketing-email] Missing template: contact_form_submission')
    return { success: false, error: 'Template not found' }
  }

  return sendMarketingEmail({
    to: process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL,
    subject: def.subject,
    html: def.html,
    text: def.text,
    templateKey: 'contact_form_submission',
    variables: {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      message: data.message,
      businessName: process.env.EMAIL_DISPLAY_NAME || DEFAULT_DISPLAY_NAME,
    },
  })
}

export async function sendDemoConfirmationEmail(data: { name: string; email: string }) {
  const def = getDefaultTemplate('demo_request_confirmation', DEFAULT_TEMPLATES)
  if (!def) {
    console.error('[marketing-email] Missing template: demo_request_confirmation')
    return { success: false, error: 'Template not found' }
  }

  return sendMarketingEmail({
    to: data.email,
    subject: def.subject,
    html: def.html,
    text: def.text,
    templateKey: 'demo_request_confirmation',
    variables: {
      name: data.name,
      businessName: process.env.EMAIL_DISPLAY_NAME || DEFAULT_DISPLAY_NAME,
    },
  })
}
