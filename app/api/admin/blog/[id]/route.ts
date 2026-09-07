import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardAdminRequest } from '@/lib/api-auth'
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/blog-store'
import { generateSlug } from '@/lib/blog-slug'
import { sanitizeBlogHtml } from '@/lib/blog-html'

const UpdateSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().max(300).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().optional(),
  featuredImageUrl: z.string().nullable().optional(),
  featuredImageAlt: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  publishedAt: z.string().nullable().optional(),
  categoryIds: z.array(z.string()).optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    const post = await getBlogPostById(id)
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ post })
  } catch (error) {
    console.error('[blog] get failed', error)
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    const body = UpdateSchema.parse(await request.json())

    await updateBlogPost(id, {
      title: body.title,
      slug: body.slug || generateSlug(body.title),
      excerpt: body.excerpt ?? null,
      content: sanitizeBlogHtml(body.content ?? ''),
      featuredImageUrl: body.featuredImageUrl ?? null,
      featuredImageAlt: body.featuredImageAlt ?? null,
      authorId: body.authorId ?? null,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      status: body.status ?? 'draft',
      publishedAt: body.publishedAt ?? null,
      categoryIds: body.categoryIds ?? [],
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }
    console.error('[blog] update failed', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const { id } = await params
    await deleteBlogPost(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[blog] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
