"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { BlogEditor, type BlogEditorHandle } from "@/components/marketing/BlogEditor";
import { generateSlug } from "@/lib/blog-slug";

interface ComposerCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface ComposerAuthor {
  id: string;
  name: string;
  is_default: boolean;
}

interface BlogComposerProps {
  id: string;
  initial: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image_url: string | null;
    featured_image_alt: string | null;
    author_id: string | null;
    meta_title: string | null;
    meta_description: string | null;
    status: "draft" | "published";
    published_at: string | null;
    categoryIds: string[];
  };
  categories: ComposerCategory[];
  authors: ComposerAuthor[];
}

type Feedback = { ok: boolean; text: string } | null;

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function BlogComposer({ id, initial, categories, authors }: BlogComposerProps) {
  const router = useRouter();
  const editorRef = useRef<BlogEditorHandle>(null);
  const featuredFileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [content, setContent] = useState(initial.content);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initial.featured_image_url ?? "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initial.featured_image_alt ?? "");
  const [authorId, setAuthorId] = useState(initial.author_id ?? "");
  const [metaTitle, setMetaTitle] = useState(initial.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial.meta_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial.status);
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocal(initial.published_at));
  const [categoryIds, setCategoryIds] = useState<string[]>(initial.categoryIds);

  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const effectiveSlug = slugEdited ? slug : generateSlug(title);

  function toggleCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function buildPayload() {
    return {
      title,
      slug: effectiveSlug || generateSlug(title),
      excerpt: excerpt || null,
      content,
      featuredImageUrl: featuredImageUrl || null,
      featuredImageAlt: featuredImageAlt || null,
      authorId: authorId || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      categoryIds,
    };
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error("Save failed");
      setFeedback({ ok: true, text: "Saved." });
    } catch {
      setFeedback({ ok: false, text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/dashboard/admin/marketing/blog");
      router.refresh();
    } catch {
      setFeedback({ ok: false, text: "Failed to delete." });
      setDeleting(false);
    }
  }

  async function handleFeaturedUpload(file: File) {
    setUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, text: data.error || "Upload failed" });
        return;
      }
      setFeaturedImageUrl(data.url);
    } catch {
      setFeedback({ ok: false, text: "Upload failed" });
    } finally {
      setUploadingFeatured(false);
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-8">
        <header className="flex flex-col gap-4">
          <Link
            href="/dashboard/admin/marketing/blog"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-chrome-500 hover:text-chrome-100"
          >
            <ArrowLeft size={14} /> Blog posts
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-3xl text-chrome-100">Edit post</h1>
              <p className="text-sm text-chrome-500">Draft, schedule, and publish a blog article.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-3 py-2 text-sm text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
              >
                {preview ? <EyeOff size={15} /> : <Eye size={15} />}
                {preview ? "Edit" : "Preview"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-signal/30 px-3 py-2 text-sm text-signal hover:border-signal"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save
              </button>
            </div>
          </div>
        </header>

        {feedback && (
          <p
            className={
              "rounded-[var(--radius-mg)] border px-4 py-2.5 text-sm " +
              (feedback.ok
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-red-500/30 bg-red-500/10 text-red-400")
            }
          >
            {feedback.text}
          </p>
        )}

        {preview ? (
          <ArticlePreview
            title={title}
            content={content}
            featuredImageUrl={featuredImageUrl}
            featuredImageAlt={featuredImageAlt}
          />
        ) : (
          <>
            {/* Title + slug + excerpt */}
            <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
              <Field label="Title">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="mg-input text-base"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Slug">
                  <input
                    type="text"
                    value={effectiveSlug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="auto-generated"
                    className="mg-input font-mono"
                  />
                </Field>
                <Field label="Author">
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="mg-input"
                  >
                    <option value="">-- No author --</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Excerpt">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Short summary shown on cards and in search results"
                  className="mg-input resize-y"
                />
              </Field>
            </div>

            {/* Featured image */}
            <div className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
              <span className="mg-eyebrow">Featured image</span>
              <input
                ref={featuredFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFeaturedUpload(file);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => featuredFileRef.current?.click()}
                  disabled={uploadingFeatured}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-3 py-2 text-sm text-chrome-300 hover:border-signal hover:text-signal disabled:opacity-50"
                >
                  {uploadingFeatured ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  Upload
                </button>
                <input
                  type="text"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="…or paste an image URL"
                  className="mg-input flex-1 min-w-[200px]"
                />
              </div>
              <Field label="Image alt text">
                <input
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the image for accessibility and SEO"
                  className="mg-input"
                />
              </Field>
              {featuredImageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-[var(--radius-mg)] border border-hairline">
                  <Image
                    src={featuredImageUrl}
                    alt={featuredImageAlt || title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Metrics + categories */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
                <span className="mg-eyebrow">Categories</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        className={
                          "rounded-[var(--radius-mg)] border px-3 py-1.5 text-sm transition-colors " +
                          (active
                            ? "border-signal bg-signal/10 text-signal"
                            : "border-hairline text-chrome-500 hover:border-chrome-500 hover:text-chrome-100")
                        }
                        style={c.parent_id ? { marginLeft: 20 } : undefined}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
                <span className="mg-eyebrow">Publishing</span>
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                    className="mg-input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>
                <Field label="Publish on">
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="mg-input"
                  />
                </Field>
                <p className="text-xs text-chrome-700">
                  Set a future date to schedule the post. Leave empty to publish
                  immediately.
                </p>
              </div>
            </div>

            {/* SEO */}
            <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
              <span className="mg-eyebrow">SEO</span>
              <Field label="Meta title">
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Leave empty to use the post title"
                  className="mg-input"
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  placeholder="Leave empty to use the excerpt"
                  className="mg-input resize-y"
                />
              </Field>
            </div>

            {/* Content editor */}
            <div className="flex flex-col gap-2">
              <span className="mg-eyebrow">Content</span>
              <BlogEditor ref={editorRef} initialHtml={content} onChange={setContent} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ── Preview ──────────────────────────────────────────────────────────────
function ArticlePreview({
  title,
  content,
  featuredImageUrl,
  featuredImageAlt,
}: {
  title: string;
  content: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
}) {
  const [html] = useState(content);
  return (
    <article className="flex flex-col gap-6">
      <h1 className="font-display text-4xl text-chrome-100">{title || "(untitled)"}</h1>
      <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {featuredImageUrl && (
        <div className="relative h-64 w-full overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline">
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt || title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="mg-eyebrow">{label}</span>
      {children}
    </label>
  );
}
