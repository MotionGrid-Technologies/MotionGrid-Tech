import Link from "next/link";
import Image from "next/image";
import { estimateReadingTime } from "@/lib/blog-reading-time";
import type { BlogPostWithRelations } from "@/lib/blog-store";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-ZA", { dateStyle: "medium" });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AuthorAvatar({
  name,
  imageUrl,
  size = 28,
}: {
  name: string;
  imageUrl: string | null;
  size?: number;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-graphite font-mono text-chrome-300"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name || "?")}
    </span>
  );
}

export function BlogCard({
  post,
  showAuthor = true,
}: {
  post: BlogPostWithRelations;
  showAuthor?: boolean;
}) {
  const readingTime = estimateReadingTime(post.content);
  const authorName = post.author?.name ?? "Motion Grid Team";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 transition-colors hover:border-hairline-soft">
      <Link
        href={`/blog/${post.slug}`}
        className="no-underline"
        aria-label={post.title}
      >
        {post.featured_image_url ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-graphite/60">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-chrome-700">
              MotionGrid
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.categories.slice(0, 3).map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-hairline px-2 py-0.5 text-[0.65rem] tracking-wide text-chrome-500"
            >
              {c.name}
            </span>
          ))}
        </div>

        <h3 className="font-display text-lg leading-snug text-chrome-100">
          <Link href={`/blog/${post.slug}`} className="no-underline hover:text-signal">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-chrome-500">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-chrome-700">
          {showAuthor && (
            <span className="flex items-center gap-1.5">
              <AuthorAvatar name={authorName} imageUrl={post.author?.image_url ?? null} size={20} />
              <span className="text-chrome-500">{authorName}</span>
            </span>
          )}
          <span>{formatDate(post.published_at)}</span>
          <span className="ml-auto">{readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
