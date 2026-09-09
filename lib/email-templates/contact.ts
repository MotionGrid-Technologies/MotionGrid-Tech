import type { TemplateDef } from './types'

// Autofield workshop contact-form template: notifies the workshop admin when a
// customer submits the workshop's contact form.
export const CONTACT_TEMPLATES: Record<string, TemplateDef> = {
  contact_form: {
    subject: 'New contact form submission from {{name}}',
    text: [
      'New contact form submission for {{businessName}}.',
      '',
      'Name: {{name}}',
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
}
