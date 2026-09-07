import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// MotionGrid blog store. Content lives in MotionGrid's own Supabase
// (SITE_SUPABASE_*), separate from the Autofield multi-tenant project.
// Server-only access via the service role (RLS has no permissive policies).
// ---------------------------------------------------------------------------

const SITE_SUPABASE_URL = process.env.SITE_SUPABASE_URL;
const SITE_SUPABASE_SERVICE_ROLE_KEY = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;

function createSiteClient() {
  if (!SITE_SUPABASE_URL || !SITE_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and " +
        "SITE_SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
  }
  return createClient<Database>(SITE_SUPABASE_URL, SITE_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BlogPostStatus = "draft" | "published";

export type BlogAuthor = {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
  is_default: boolean;
  created_at: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type BlogPostWithRelations = BlogPost & {
  author: BlogAuthor | null;
  categories: BlogCategory[];
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  authorId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status?: BlogPostStatus;
  publishedAt?: string | null;
  categoryIds?: string[];
};

type PostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type AuthorRow = Database["public"]["Tables"]["blog_authors"]["Row"];
type CategoryRow = Database["public"]["Tables"]["blog_categories"]["Row"];

function mapAuthor(row: AuthorRow): BlogAuthor {
  return {
    id: row.id,
    name: row.name,
    image_url: row.image_url ?? null,
    bio: row.bio ?? null,
    is_default: row.is_default,
    created_at: row.created_at,
  };
}

function mapCategory(row: CategoryRow): BlogCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parent_id: row.parent_id ?? null,
    created_at: row.created_at,
  };
}

function mapPost(row: PostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? null,
    content: row.content,
    featured_image_url: row.featured_image_url ?? null,
    featured_image_alt: row.featured_image_alt ?? null,
    author_id: row.author_id ?? null,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    status: row.status as BlogPostStatus,
    published_at: row.published_at ?? null,
    view_count: row.view_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------
export { generateSlug } from "@/lib/blog-slug";

async function ensureUniqueSlug(
  client: ReturnType<typeof createSiteClient>,
  slug: string,
  excludeId?: string
): Promise<string> {
  const base = slug || "post";
  let candidate = base;
  let i = 2;

  while (true) {
    let query = client.from("blog_posts").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}

// ---------------------------------------------------------------------------
// View tracking helper
// ---------------------------------------------------------------------------
export function hashViewerIdentifier(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------
export async function listBlogAuthors(): Promise<BlogAuthor[]> {
  const { data, error } = await createSiteClient()
    .from("blog_authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapAuthor);
}

export async function createBlogAuthor(input: {
  name: string;
  imageUrl?: string | null;
  bio?: string | null;
  isDefault?: boolean;
}): Promise<BlogAuthor> {
  const { data, error } = await createSiteClient()
    .from("blog_authors")
    .insert({
      name: input.name,
      image_url: input.imageUrl ?? null,
      bio: input.bio ?? null,
      is_default: input.isDefault ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapAuthor(data);
}

export async function getDefaultBlogAuthor(): Promise<BlogAuthor | null> {
  const client = createSiteClient();
  const { data } = await client
    .from("blog_authors")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();

  if (data) return mapAuthor(data);

  const { data: first } = await client
    .from("blog_authors")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return first ? mapAuthor(first) : null;
}

// ---------------------------------------------------------------------------
// Categories (parent/child hierarchy)
// ---------------------------------------------------------------------------
export async function listBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await createSiteClient()
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function createBlogCategory(input: {
  name: string;
  slug: string;
  parentId?: string | null;
}): Promise<BlogCategory> {
  const client = createSiteClient();

  if (input.parentId) {
    const { data: parent } = await client
      .from("blog_categories")
      .select("id")
      .eq("id", input.parentId)
      .maybeSingle();
    if (!parent) throw new Error("Parent category not found");
  }

  const { data, error } = await client
    .from("blog_categories")
    .insert({
      name: input.name,
      slug: input.slug,
      parent_id: input.parentId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCategory(data);
}

export async function deleteBlogCategory(id: string): Promise<void> {
  const { error } = await createSiteClient()
    .from("blog_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

async function resolveCategoryIds(slug: string): Promise<string[]> {
  const client = createSiteClient();
  const { data: root } = await client
    .from("blog_categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!root) return [];

  const ids: string[] = [root.id];
  const queue: string[] = [root.id];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { data: children } = await client
      .from("blog_categories")
      .select("id")
      .eq("parent_id", current);
    for (const child of children ?? []) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Posts — internal helpers
// ---------------------------------------------------------------------------
async function setBlogPostCategories(
  client: ReturnType<typeof createSiteClient>,
  postId: string,
  categoryIds: string[]
): Promise<void> {
  await client.from("blog_post_categories").delete().eq("post_id", postId);

  const unique = [...new Set(categoryIds)];
  if (unique.length > 0) {
    const { error } = await client
      .from("blog_post_categories")
      .insert(unique.map((categoryId) => ({ post_id: postId, category_id: categoryId })));
    if (error) throw error;
  }
}

async function hydratePosts(rows: PostRow[]): Promise<BlogPostWithRelations[]> {
  if (rows.length === 0) return [];

  const client = createSiteClient();
  const authorIds = [...new Set(rows.map((r) => r.author_id).filter(Boolean))] as string[];
  const postIds = rows.map((r) => r.id);

  const [authorsRes, linksRes] = await Promise.all([
    authorIds.length > 0
      ? client.from("blog_authors").select("*").in("id", authorIds)
      : Promise.resolve({ data: [] as AuthorRow[], error: null }),
    client.from("blog_post_categories").select("post_id, category_id").in("post_id", postIds),
  ]);

  const categoryIds = [...new Set((linksRes.data ?? []).map((l) => l.category_id))];
  const categoriesRes =
    categoryIds.length > 0
      ? await client.from("blog_categories").select("*").in("id", categoryIds)
      : { data: [] as CategoryRow[] };

  const authorMap = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));
  const categoryMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]));

  return rows.map((row) => ({
    ...mapPost(row),
    author: row.author_id ? authorMap.get(row.author_id) ?? null : null,
    categories: (linksRes.data ?? [])
      .filter((l) => l.post_id === row.id)
      .map((l) => categoryMap.get(l.category_id))
      .filter((c): c is CategoryRow => Boolean(c))
      .map(mapCategory),
  }));
}

// ---------------------------------------------------------------------------
// Posts — CRUD
// ---------------------------------------------------------------------------
export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  const client = createSiteClient();
  const slug = await ensureUniqueSlug(client, input.slug);

  const { data, error } = await client
    .from("blog_posts")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content ?? "",
      featured_image_url: input.featuredImageUrl ?? null,
      featured_image_alt: input.featuredImageAlt ?? null,
      author_id: input.authorId ?? null,
      meta_title: input.metaTitle ?? null,
      meta_description: input.metaDescription ?? null,
      status: input.status ?? "draft",
      published_at: input.publishedAt ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  if (input.categoryIds && input.categoryIds.length > 0) {
    await setBlogPostCategories(client, data.id, input.categoryIds);
  }

  return mapPost(data);
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<void> {
  const client = createSiteClient();
  const slug = await ensureUniqueSlug(client, input.slug, id);

  const update: Database["public"]["Tables"]["blog_posts"]["Update"] = {
    title: input.title,
    slug,
    excerpt: input.excerpt ?? null,
    content: input.content ?? "",
    featured_image_url: input.featuredImageUrl ?? null,
    featured_image_alt: input.featuredImageAlt ?? null,
    author_id: input.authorId ?? null,
    meta_title: input.metaTitle ?? null,
    meta_description: input.metaDescription ?? null,
    status: input.status ?? "draft",
    published_at: input.publishedAt ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("blog_posts").update(update).eq("id", id);
  if (error) throw error;

  if (input.categoryIds) {
    await setBlogPostCategories(client, id, input.categoryIds);
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await createSiteClient().from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function getBlogPostById(
  id: string,
  options: { publishedOnly?: boolean } = {}
): Promise<BlogPostWithRelations | null> {
  const client = createSiteClient();
  let query = client.from("blog_posts").select("*").eq("id", id);
  if (options.publishedOnly) {
    query = query
      .eq("status", "published")
      .lte("published_at", new Date().toISOString());
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [hydrated] = await hydratePosts([data]);
  return hydrated ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  const { data, error } = await createSiteClient()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [hydrated] = await hydratePosts([data]);
  return hydrated ?? null;
}

export async function listBlogPosts(options: {
  status?: BlogPostStatus;
} = {}): Promise<BlogPostWithRelations[]> {
  let query = createSiteClient().from("blog_posts").select("*");
  if (options.status) query = query.eq("status", options.status);
  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) throw error;
  return hydratePosts(data ?? []);
}

export async function listPublishedBlogPosts(options: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
} = {}): Promise<{ posts: BlogPostWithRelations[]; total: number }> {
  const { page = 1, perPage = 12, categorySlug } = options;
  const client = createSiteClient();
  const now = new Date().toISOString();

  let query = client
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .lte("published_at", now);

  if (categorySlug) {
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (categoryIds.length === 0) return { posts: [], total: 0 };
    const { data: links } = await client
      .from("blog_post_categories")
      .select("post_id")
      .in("category_id", categoryIds);
    const postIds = (links ?? []).map((l) => l.post_id);
    if (postIds.length === 0) return { posts: [], total: 0 };
    query = query.in("id", postIds);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, count, error } = await query
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    posts: await hydratePosts(data ?? []),
    total: count ?? 0,
  };
}

export async function listAllPublishedBlogPosts(): Promise<BlogPostWithRelations[]> {
  const { data, error } = await createSiteClient()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) throw error;
  return hydratePosts(data ?? []);
}

export async function listPopularBlogPosts(limit = 4): Promise<BlogPostWithRelations[]> {
  const { data, error } = await createSiteClient()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return hydratePosts(data ?? []);
}

export async function listSimilarBlogPosts(
  postId: string,
  limit = 3
): Promise<BlogPostWithRelations[]> {
  const client = createSiteClient();

  const { data: links } = await client
    .from("blog_post_categories")
    .select("category_id")
    .eq("post_id", postId);
  const categoryIds = (links ?? []).map((l) => l.category_id);
  if (categoryIds.length === 0) return [];

  const { data: similarLinks } = await client
    .from("blog_post_categories")
    .select("post_id")
    .in("category_id", categoryIds)
    .neq("post_id", postId);

  const postIds = [...new Set((similarLinks ?? []).map((l) => l.post_id))];
  if (postIds.length === 0) return [];

  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .in("id", postIds)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return hydratePosts(data ?? []);
}

// ---------------------------------------------------------------------------
// View counter (unique per 24h by viewer hash)
// ---------------------------------------------------------------------------
export async function incrementBlogView(postId: string, viewerHash: string): Promise<void> {
  const client = createSiteClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await client
    .from("blog_views")
    .select("id")
    .eq("post_id", postId)
    .eq("viewer_hash", viewerHash)
    .gte("viewed_at", since)
    .maybeSingle();

  if (existing) return;

  const { error: viewError } = await client
    .from("blog_views")
    .insert({ post_id: postId, viewer_hash: viewerHash });
  if (viewError) return;

  const { data: post } = await client
    .from("blog_posts")
    .select("view_count")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return;

  await client
    .from("blog_posts")
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq("id", postId);
}
