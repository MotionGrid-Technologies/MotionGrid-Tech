import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardAdminRequest } from '@/lib/api-auth'
import { listBlogPosts, createBlogPost } from '@/lib/blog-store'
import { generateSlug } from '@/lib/blog-slug'
import { sanitizeBlogHtml } from '@/lib/blog-html'

const CreateSchema = z.object({
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

export async function GET(request: Request) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const posts = await listBlogPosts(
      status === 'draft' || status === 'published' ? { status } : {}
    )
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[blog] list failed', error)
    return NextResponse.json({ error: 'Failed to list posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest(request)
  if (guardResponse) return guardResponse

  try {
    const body = CreateSchema.parse(await request.json())
    const post = await createBlogPost({
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
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }
    console.error('[blog] create failed', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
