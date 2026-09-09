import { NewBlogButton } from "@/components/marketing/NewBlogButton";
import { BlogPostsTable } from "@/components/marketing/BlogPostsTable";
import { listBlogPosts } from "@/lib/blog-store";
import { listBlogCategories } from "@/lib/blog-store";
import { listBlogAuthors } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export default async function BlogListPage() {
  const [posts, categories, authors] = await Promise.all([
    listBlogPosts(),
    listBlogCategories(),
    listBlogAuthors(),
  ]);

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl text-chrome-100">Blog posts</h1>
            <p className="text-sm text-chrome-500">
              Write, schedule, and publish articles for the public blog.
            </p>
          </div>
          <NewBlogButton categories={categories} authors={authors} />
        </header>

        <BlogPostsTable posts={posts} />
      </div>
    </section>
  );
}
