import { notFound } from "next/navigation";
import { BlogComposer } from "@/components/marketing/BlogComposer";
import { getBlogPostById, listBlogCategories, listBlogAuthors } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Post",
  robots: { index: false, follow: false },
};

export default async function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, categories, authors] = await Promise.all([
    getBlogPostById(id),
    listBlogCategories(),
    listBlogAuthors(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <BlogComposer
      id={post.id}
      initial={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image_url: post.featured_image_url,
        featured_image_alt: post.featured_image_alt,
        author_id: post.author_id,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        status: post.status,
        published_at: post.published_at,
        categoryIds: post.categories.map((c) => c.id),
      }}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parent_id: c.parent_id,
      }))}
      authors={authors.map((a) => ({
        id: a.id,
        name: a.name,
        is_default: a.is_default,
      }))}
    />
  );
}
