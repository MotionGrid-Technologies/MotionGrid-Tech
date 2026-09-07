import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardAdminRequest } from '@/lib/api-auth'
import {
  getMarketingEmail,
  updateMarketingEmail,
  deleteMarketingEmail,
} from '@/lib/marketing-emails-store'

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().max(500).optional(),
  html_body: z.string().min(1).max(500_000).optional(),
  text_body: z.string().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    const email = await getMarketingEmail(id)
    if (!email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ email })
  } catch (error) {
    console.error('[marketing-emails] get failed', error)
    return NextResponse.json({ error: 'Failed to load email' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    const body = UpdateSchema.parse(await request.json())
    const updated = await updateMarketingEmail(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }
    console.error('[marketing-emails] update failed', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    const deleted = await deleteMarketingEmail(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[marketing-emails] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 })
  }
}
