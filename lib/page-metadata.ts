import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getPageSeo } from "@/lib/page-seo-store";

/** Merges a page's defaults with its admin-managed SEO override. */
export async function buildPageMetadata(
  path: string,
  base: {
    title: string;
    description: string;
    keywords?: string[];
    openGraph?: Partial<Metadata["openGraph"]>;
  }
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

  const canonicalUrl = path === "/" ? site.url : `${site.url}${path}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      locale: "en_ZA",
      type: "website",
      siteName: site.name,
      url: canonicalUrl,
      title,
      description,
      ...(base.openGraph ?? {}),
    },
    twitter: {
      title,
      description,
    },
  };
}
