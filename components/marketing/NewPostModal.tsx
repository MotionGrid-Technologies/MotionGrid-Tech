"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/blog-slug";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  is_default: boolean;
}

interface NewPostModalProps {
  categories: Category[];
  authors: Author[];
  open: boolean;
  onClose: () => void;
}

export function NewPostModal({ categories, authors, open, onClose }: NewPostModalProps) {
  const router = useRouter();

  const defaultAuthor =
    authors.find((a) => a.is_default) ?? authors[0] ?? null;

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState(defaultAuthor?.id ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugPreview = useMemo(
    () => (slugEdited ? slug : generateSlug(title)),
    [slugEdited, slug, title]
  );

  if (!open) return null;

  function reset() {
    setTitle("");
    setCategoryId("");
    setAuthorId(defaultAuthor?.id ?? "");
    setSlugEdited(false);
    setSlug("");
    setError(null);
  }

  async function handleCreate() {
    const finalTitle = title.trim();
    if (!finalTitle) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          slug: slugPreview,
          categoryIds: categoryId ? [categoryId] : [],
          authorId: authorId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setCreating(false);
        return;
      }
      reset();
      onClose();
      router.push(`/dashboard/admin/marketing/blog/${data.post.id}`);
      router.refresh();
    } catch {
      setError("Failed to create post");
      setCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="New post"
    >
      <div
        className="w-full max-w-lg rounded-[var(--radius-mg-lg)] border border-hairline bg-obsidian-soft p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-chrome-100">New blog post</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-chrome-500 hover:text-chrome-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal focus:outline-none"
            />
          </Field>

          <Field label="Slug">
            <input
              type="text"
              value={slugPreview}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="auto-generated"
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 font-mono text-sm text-chrome-300 placeholder:text-chrome-700 focus:border-signal focus:outline-none"
            />
          </Field>

          <Field label="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 text-sm text-chrome-100 focus:border-signal focus:outline-none"
            >
              <option value="">-- No category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Author">
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full appearance-none rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 text-sm text-chrome-100 focus:border-signal focus:outline-none"
            >
              <option value="">-- No author --</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-mg)] border border-hairline px-4 py-2 text-sm text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !title.trim()}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90 disabled:opacity-50"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
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
