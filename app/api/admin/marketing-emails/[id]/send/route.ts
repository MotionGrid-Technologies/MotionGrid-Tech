import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthorized, isRateLimited } from '@/lib/api-auth'
import { getMarketingEmail } from '@/lib/marketing-emails-store'
import { sendMarketingEmail } from '@/lib/marketing-email'
import { renderMergeTags } from '@/lib/marketing-merge-tags'

const SendSchema = z.object({
  to: z.string().email(),
})

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { id } = await params
    const email = await getMarketingEmail(id)
    if (!email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = SendSchema.parse(await request.json())

    const result = await sendMarketingEmail({
      to: body.to,
      subject: renderMergeTags(email.subject),
      html: renderMergeTags(email.html_body),
      text: email.text_body ? renderMergeTags(email.text_body) : undefined,
      templateKey: 'marketing_test_send',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ ok: true, messageId: result.messageId })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }
    console.error('[marketing-emails] send failed', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
