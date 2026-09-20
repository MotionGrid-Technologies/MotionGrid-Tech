import type { Metadata } from "next";
import { getPageSeo } from "@/lib/page-seo-store";

// Builds a page's Metadata by merging any admin-managed SEO override stored in
// page_seo over a hardcoded base. Used by every public page's generateMetadata
// so admins can edit titles/descriptions/keywords without touching code.

export async function buildPageMetadata(
  path: string,
  base: { title: string; description: string; keywords?: string[] }
): Promise<Metadata> {
  let override: Awaited<ReturnType<typeof getPageSeo>> = null;
  try {
    override = await getPageSeo(path);
  } catch (error) {
    // A Supabase outage or misconfigured key must never break page rendering —
    // fall back to the hardcoded metadata.
    console.warn(`[page-seo] override unavailable for ${path}`, error);
  }

  const title = override?.meta_title?.trim() || base.title;
  const description = override?.meta_description?.trim() || base.description;
  const keywords = [
    ...(base.keywords ?? []),
    ...(override?.meta_keywords
      ? override.meta_keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : []),
  ];

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}