import { BlogComposer } from "@/components/marketing/BlogComposer";
import { listBlogCategories, listBlogAuthors } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Post",
  robots: { index: false, follow: false },
};

export default async function NewBlogPostPage() {
  const [categories, authors] = await Promise.all([
    listBlogCategories(),
    listBlogAuthors(),
  ]);

  return (
    <BlogComposer
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image_url: null,
        featured_image_alt: "",
        author_id: authors.find((a) => a.is_default)?.id ?? authors[0]?.id ?? "",
        meta_title: "",
        meta_description: "",
        status: "draft",
        published_at: null,
        categoryIds: [],
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