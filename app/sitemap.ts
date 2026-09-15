import type { MetadataRoute } from "next";
import { listAllPublishedBlogPosts } from "@/lib/blog-store";
import { caseStudies } from "@/lib/case-studies";
import { site } from "@/lib/site";

const staticRoutes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/products", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/technology", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/industries", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/case-studies", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/testimonials", changeFrequency: "monthly" as const, priority: 0.5 },
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

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${site.url}/case-studies/${cs.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Blog posts come from Supabase. If the DB is unreachable (e.g. building in
  // an environment without credentials), ship the static + case-study entries
  // rather than failing the whole build — the next successful build catches up.
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await listAllPublishedBlogPosts();
    postEntries = posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] Could not read blog posts — shipping without them:", err);
  }

  return [...staticEntries, ...caseStudyEntries, ...postEntries];
}
