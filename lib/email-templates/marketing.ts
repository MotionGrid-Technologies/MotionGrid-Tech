import type { TemplateDef } from './types'

// MotionGrid marketing/lead email templates. These are separate from the
// Autofield workshop templates: they use MotionGrid branding and are sent via
// lib/marketing-email.ts (env-based sender, no workshop lookup).
export const MARKETING_TEMPLATES: Record<string, TemplateDef> = {
  contact_form_submission: {
    subject: 'New contact form submission from {{name}}',
    text: [
      'New contact form submission received on the MotionGrid website.',
      '',
      'Name: {{name}}',
      'Company: {{company}}',
      'Email: {{email}}',
      'Phone: {{phone}}',
      '',
      'Message:',
      '{{message}}',
    ].join('\n'),
    html: [
      '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937;">',
      '<h2>{{businessName}}</h2>',
      '<p>A new contact form submission was received:</p>',
      '<table style="width:100%;border-collapse:collapse;margin:16px 0;">',
      '<tr><td style="padding:6px 0;"><strong>Name</strong></td><td>{{name}}</td></tr>',
      '<tr><td style="padding:6px 0;"><strong>Company</strong></td><td>{{company}}</td></tr>',
      '<tr><td style="padding:6px 0;"><strong>Email</strong></td><td>{{email}}</td></tr>',
      '<tr><td style="padding:6px 0;"><strong>Phone</strong></td><td>{{phone}}</td></tr>',
      '</table>',
      '<div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">',
      '<p style="margin:0;"><strong>Message</strong></p>',
      '<p style="margin:8px 0 0;">{{message}}</p>',
      '</div>',
      '</div>',
    ].join(''),
  },

  demo_request_confirmation: {
    subject: 'Thanks for your interest, {{name}}',
    text: [
      'Hi {{name}},',
      '',
      'Thanks for reaching out to {{businessName}}.',
      '',
      'We have received your demo request and will be in touch shortly to schedule a session that fits your schedule.',
      '',
      'In the meantime, feel free to explore our live sandbox and micro-tools on the site.',
      '',
      'Talk soon,',
      'The {{businessName}} team',
    ].join('\n'),
    html: [
      '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937;">',
      '<h2>{{businessName}}</h2>',
      '<p>Hi {{name}},</p>',
      '<p>Thanks for reaching out. We have received your demo request and will be in touch shortly to schedule a session that fits your schedule.</p>',
      '<p>In the meantime, feel free to explore our live sandbox and micro-tools on the site.</p>',
      '<p style="font-size:12px;color:#9ca3af;margin-top:24px;">&mdash; The {{businessName}} team</p>',
      '</div>',
    ].join(''),
  },
}
