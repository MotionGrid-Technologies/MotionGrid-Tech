import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard, AuthorAvatar } from "@/components/blog/BlogCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { listBlogCategories, listPublishedBlogPosts, listPopularBlogPosts } from "@/lib/blog-store";
import { estimateReadingTime } from "@/lib/blog-reading-time";

export const dynamic = "force-dynamic";

const PER_PAGE = 9;

export const metadata = {
  title: "Blog",
  description:
    "Insights and articles from MotionGrid Technologies on bespoke software, engineering, product, and design.",
  alternates: {
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

export default async function BlogArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, popular] = await Promise.all([
    listBlogCategories(),
    listPopularBlogPosts(4),
  ]);

  const noFilter = !categorySlug;

  // Hero query only on the unfiltered first page.
  const heroPost =
    noFilter && page === 1
      ? (await listPublishedBlogPosts({ page: 1, perPage: 1 })).posts[0] ?? null
      : null;

  const { posts, total } = await listPublishedBlogPosts({
    page,
    perPage: PER_PAGE,
    categorySlug: categorySlug || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-16 px-6 md:px-10">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <p className="font-mono text-sm tracking-[0.3em] text-signal uppercase">Blog</p>
          <h1 className="max-w-3xl font-display text-4xl text-chrome-100 md:text-6xl">
            Ideas, insights &amp; engineering notes
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Thoughts on bespoke software, technology, product, and design from
            the MotionGrid team.
          </p>
        </header>

        {/* Hero post */}
        {heroPost && (
          <Link
            href={`/blog/${heroPost.slug}`}
            className="group grid grid-cols-1 gap-6 overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 no-underline transition-colors hover:border-chrome-500 lg:grid-cols-2"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-auto lg:min-h-[340px]">
              {heroPost.featured_image_url ? (
                <Image
                  src={heroPost.featured_image_url}
                  alt={heroPost.featured_image_alt || heroPost.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-graphite/60">
                  <span className="font-mono text-xs tracking-[0.3em] uppercase text-chrome-700">
                    MotionGrid
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 lg:p-10">
              <div className="flex flex-wrap gap-1.5">
                {heroPost.categories.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border border-hairline px-2 py-0.5 text-[0.65rem] tracking-wide text-chrome-500"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="font-mono text-xs tracking-[0.3em] text-signal uppercase">
                Latest
              </p>
              <h2 className="font-display text-2xl leading-tight text-chrome-100 md:text-4xl">
                {heroPost.title}
              </h2>
              {heroPost.excerpt && (
                <p className="line-clamp-3 text-sm leading-relaxed text-chrome-500">
                  {heroPost.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-chrome-700">
                {heroPost.author && (
                  <span className="flex items-center gap-1.5">
                    <AuthorAvatar
                      name={heroPost.author.name}
                      imageUrl={heroPost.author.image_url}
                      size={22}
                    />
                    <span className="text-chrome-500">{heroPost.author.name}</span>
                  </span>
                )}
                {heroPost.published_at && (
                  <span>
                    {new Date(heroPost.published_at).toLocaleDateString("en-ZA", {
                      dateStyle: "medium",
                    })}
                  </span>
                )}
                <span>{estimateReadingTime(heroPost.content)} min read</span>
                <span className="ml-auto text-signal">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Popular posts */}
        {popular.length > 1 && noFilter && (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl text-chrome-100">Popular posts</h2>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-hairline md:grid-cols-4">
              {popular.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="flex flex-col gap-2 bg-black p-5 no-underline transition-colors hover:bg-graphite"
                >
                  <span className="font-mono text-xs text-chrome-700">
                    {p.view_count} views
                  </span>
                  <h3 className="font-display text-base leading-snug text-chrome-100">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid + filter */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-chrome-100">All articles</h2>
            <CategoryFilter
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              current={categorySlug}
            />
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-16 text-center">
              <p className="text-sm text-chrome-500">No articles found.</p>
              <p className="text-xs text-chrome-700">Try a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const href =
                  p === 1
                    ? categorySlug
                      ? `/blog?category=${categorySlug}`
                      : "/blog"
                    : `/blog?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}`;
                const active = p === page;
                return (
                  <Link
                    key={p}
                    href={href}
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-[var(--radius-mg)] border text-sm transition-colors " +
                      (active
                        ? "border-signal bg-signal text-black"
                        : "border-hairline text-chrome-500 hover:border-chrome-500 hover:text-chrome-100")
                    }
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
