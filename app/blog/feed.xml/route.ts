import { listAllPublishedBlogPosts } from "@/lib/blog-store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await listAllPublishedBlogPosts();

  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      const description = escapeXml(
        (post.meta_description || post.excerpt || "").replace(/<[^>]*>/g, "")
      );
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="false">${url}</guid>`,
        description ? `      <description>${description}</description>` : "",
        `      <pubDate>${pubDate}</pubDate>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)} — Blog</title>`,
    `    <link>${site.url}/blog</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <atom:link href="${site.url}/blog/feed.xml" rel="self" type="application/rss+xml" />`,
    `    <language>en-za</language>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
