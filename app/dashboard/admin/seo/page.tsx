import { SeoAdminTabs } from "@/components/admin/SeoAdminTabs";
import { type SeoPost } from "@/components/admin/SeoScorer";
import { type SeoPage } from "@/components/admin/PageSeoTable";
import { listBlogPosts } from "@/lib/blog-store";
import { listPageSeo } from "@/lib/page-seo-store";
import { publicPages } from "@/lib/public-pages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO",
  robots: { index: false, follow: false },
};

export default async function SeoPage() {
  const posts = await listBlogPosts({ status: "published" });

  // Best-effort overrides: before the page_seo migration is applied (or during
  // a Supabase outage) the SEO page still renders, just without saved overrides.
  let overrides: Awaited<ReturnType<typeof listPageSeo>> = [];
  try {
    overrides = await listPageSeo();
  } catch (error) {
    console.warn("[page-seo] overrides unavailable", error);
  }

  const seoPosts: SeoPost[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    content: p.content,
  }));

  const seoPages: SeoPage[] = publicPages.map((pg) => ({
    id: pg.path,
    path: pg.path,
    label: pg.label,
  }));

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-chrome-100">SEO</h1>
          <p className="text-sm text-chrome-500">
            Grade public pages and blog posts against on-page SEO best practices
            and edit each page&apos;s title, meta description, and keywords.
            Public pages are scored from the real HTML being served.
          </p>
        </header>

        <SeoAdminTabs posts={seoPosts} pages={seoPages} overrides={overrides} />
      </div>
    </section>
  );
}