import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardAdminRequest } from '@/lib/api-auth'
import { listMarketingEmails, createMarketingEmail } from '@/lib/marketing-emails-store'

const MAX_HTML_BODY_LENGTH = 500_000

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().max(500).default(''),
  html_body: z.string().min(1).max(MAX_HTML_BODY_LENGTH),
  text_body: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { searchParams } = new URL(request.url)
    const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '', 10)
    const parsedOffset = Number.parseInt(searchParams.get('offset') ?? '', 10)
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(100, Math.max(1, parsedLimit))
      : 50
    const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0
    const emails = await listMarketingEmails(limit, offset)
    return NextResponse.json({ emails })
  } catch (error) {
    console.error('[marketing-emails] list failed', error)
    return NextResponse.json({ error: 'Failed to list emails' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const body = CreateSchema.parse(await request.json())
    const email = await createMarketingEmail({
      name: body.name,
      subject: body.subject,
      html_body: body.html_body,
      text_body: body.text_body ?? null,
    })
    return NextResponse.json({ email }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }
    console.error('[marketing-emails] create failed', error)
    return NextResponse.json({ error: 'Failed to create email' }, { status: 500 })
  }
}
