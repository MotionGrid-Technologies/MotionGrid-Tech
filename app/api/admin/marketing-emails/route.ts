import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthorized, isRateLimited } from '@/lib/api-auth'
import { listMarketingEmails, createMarketingEmail } from '@/lib/marketing-emails-store'

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().max(500).default(''),
  html_body: z.string().min(1),
  text_body: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const emails = await listMarketingEmails()
    return NextResponse.json({ emails })
  } catch (error) {
    console.error('[marketing-emails] list failed', error)
    return NextResponse.json({ error: 'Failed to list emails' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
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
