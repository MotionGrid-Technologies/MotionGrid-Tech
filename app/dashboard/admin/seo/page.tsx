import { SeoScorer, type SeoPost, type SeoPage } from "@/components/admin/SeoScorer";
import { listBlogPosts } from "@/lib/blog-store";
import { publicPages } from "@/lib/public-pages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO",
  robots: { index: false, follow: false },
};

export default async function SeoPage() {
  const posts = await listBlogPosts({ status: "published" });

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
          <h1 className="font-display text-3xl text-chrome-100">SEO scorer</h1>
          <p className="text-sm text-chrome-500">
            Grade blog posts and live public pages against on-page SEO best
            practices — title, meta description, headings, images, keyword
            placement, and content length. Public pages are scored from the
            real HTML being served, so results never go stale.
          </p>
        </header>

        <SeoScorer posts={seoPosts} pages={seoPages} />
      </div>
    </section>
  );
}