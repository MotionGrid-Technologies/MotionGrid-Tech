import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BlogCard, AuthorAvatar } from "@/components/blog/BlogCard";
import {
  getBlogPostBySlug,
  hashViewerIdentifier,
  incrementBlogView,
  listSimilarBlogPosts,
} from "@/lib/blog-store";
import { estimateReadingTime } from "@/lib/blog-reading-time";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const url = `${site.url}/blog/${post.slug}`;
  const metaTitle = post.meta_title || `${post.title} — ${site.name}`;
  const metaDescription = post.meta_description || post.excerpt || "";

  return {
    title: post.meta_title ? `${post.title}` : post.title,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: site.name,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.featured_image_url
        ? [{ url: post.featured_image_url }]
        : [{ url: `${site.url}/og-image.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: post.featured_image_url
        ? [post.featured_image_url]
        : [`${site.url}/og-image.png`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  // Unique view increment: hash IP + user-agent, deduped for 24h in the store.
  try {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown";
    const ua = headerList.get("user-agent") || "unknown";
    const viewerHash = hashViewerIdentifier(`${ip}|${ua}`);
    await incrementBlogView(post.id, viewerHash);
  } catch {
    // View tracking is best-effort — never block the page render.
  }

  const similar = await listSimilarBlogPosts(post.id, 3);
  const readingTime = estimateReadingTime(post.content);
  const author = post.author;
  const authorName = author?.name ?? "Motion Grid Team";
  const postUrl = `${site.url}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    url: postUrl,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    image: post.featured_image_url || `${site.url}/og-image.png`,
    author: {
      "@type": "Person",
      name: authorName,
      ...(author?.image_url ? { image: author.image_url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="py-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 md:px-10">
          {/* Title block */}
          <header className="flex flex-col gap-5">
            <Link
              href="/blog"
              className="inline-flex w-fit items-center gap-1.5 text-sm text-chrome-500 no-underline hover:text-chrome-100"
            >
              ← Blog
            </Link>

            <div className="flex flex-wrap gap-1.5">
              {post.categories.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-hairline px-2.5 py-0.5 text-[0.7rem] tracking-wide text-chrome-500"
                >
                  {c.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl leading-tight text-chrome-100 md:text-5xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-chrome-700">
              <span className="flex items-center gap-2">
                <AuthorAvatar name={authorName} imageUrl={author?.image_url ?? null} size={32} />
                <span className="text-chrome-500">{authorName}</span>
              </span>
              <span aria-hidden>·</span>
              <span>
                {post.published_at &&
                  new Date(post.published_at).toLocaleDateString("en-ZA", {
                    dateStyle: "long",
                  })}
              </span>
              <span aria-hidden>·</span>
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Featured image */}
          {post.featured_image_url && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline">
              <Image
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Author card */}
          <aside className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6 sm:flex-row sm:items-center">
            <AuthorAvatar name={authorName} imageUrl={author?.image_url ?? null} size={56} />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-chrome-700">
                Written by
              </p>
              <p className="font-display text-lg text-chrome-100">{authorName}</p>
              {author?.bio && <p className="text-sm text-chrome-500">{author.bio}</p>}
            </div>
          </aside>

          {/* Lead capture CTA */}
          <aside className="flex flex-col items-center gap-4 rounded-[var(--radius-mg-lg)] border border-signal/30 bg-signal/5 p-8 text-center">
            <h2 className="font-display text-2xl text-chrome-100">
              Ready to build your bespoke software?
            </h2>
            <p className="max-w-md text-sm text-chrome-500">
              Book a free demo and let&apos;s discuss how MotionGrid can engineer
              the right solution for your business.
            </p>
            <Link
              href="/contact#demo"
              className="inline-flex items-center gap-2 rounded-[var(--radius-mg)] bg-signal px-6 py-3 text-sm font-semibold text-black no-underline hover:bg-signal/90"
            >
              Book a Demo <ArrowRight size={15} />
            </Link>
          </aside>
        </div>

        {/* Similar posts */}
        {similar.length > 0 && (
          <div className="mx-auto mt-20 max-w-[1400px] px-6 md:px-10">
            <div className="flex flex-col gap-6">
              <h2 className="font-display text-2xl text-chrome-100">Similar posts</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
