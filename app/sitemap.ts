import type { MetadataRoute } from "next";
import { listAllPublishedBlogPosts } from "@/lib/blog-store";
import { site } from "@/lib/site";

const staticRoutes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/products", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/technology", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/industries", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/blog", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/sandbox", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/tools", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/legal/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/legal/cookies", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts = await listAllPublishedBlogPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
