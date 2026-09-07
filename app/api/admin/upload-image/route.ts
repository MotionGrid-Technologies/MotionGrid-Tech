import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthorized, isRateLimited } from '@/lib/api-auth'

// ---------------------------------------------------------------------------
// Image upload for blog featured images and inline Tiptap content.
// Uploads to MotionGrid's own Supabase Storage (SITE_SUPABASE_*) — the
// `blog-images` public bucket — via the service role, and returns the public
// URL. Server-side upload means no browser CORS configuration is required.
// ---------------------------------------------------------------------------

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

function createSiteStorageClient() {
  const url = process.env.SITE_SUPABASE_URL
  const key = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and ' +
        'SITE_SUPABASE_SERVICE_ROLE_KEY in the environment.'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

function extFromType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  }
  return map[contentType] ?? 'bin'
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let file: File
  try {
    const formData = await request.formData()
    const entry = formData.get('file')
    if (!(entry instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }
    file = entry
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image exceeds 5MB limit' }, { status: 400 })
  }

  try {
    const ext = extFromType(file.type)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
    const path = `uploads/${name}`

    const client = createSiteStorageClient()
    const { error: uploadError } = await client.storage
      .from('blog-images')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('[upload-image] upload failed', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = client.storage.from('blog-images').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[upload-image] failed', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
