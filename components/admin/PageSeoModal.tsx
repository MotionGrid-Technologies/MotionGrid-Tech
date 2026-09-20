"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { site } from "@/lib/site";
import type { PageSeoOverride } from "@/lib/page-seo-store";

interface PageSeoModalProps {
  page: { path: string; label: string };
  override: PageSeoOverride | null;
  onClose: () => void;
  onSaved: (override: PageSeoOverride) => void;
}

export function PageSeoModal({ page, override, onClose, onSaved }: PageSeoModalProps) {
  // The modal is mounted only while editing, so initializing from props is safe.
  const [metaTitle, setMetaTitle] = useState(override?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(override?.meta_description ?? "");
  const [metaKeywords, setMetaKeywords] = useState(override?.meta_keywords ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/page-seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: page.path,
          metaTitle,
          metaDescription,
          metaKeywords,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onSaved(data.override);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%_-_2rem)] max-w-2xl bg-transparent p-0 backdrop:bg-black/70"
      aria-label={`Edit SEO for ${page.label}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-[var(--radius-mg-lg)] border border-hairline bg-obsidian-soft p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-chrome-100">Edit SEO metadata</h2>
            <p className="mg-eyebrow mt-1">
              {page.label} · <span className="text-chrome-500">{page.path}</span>
            </p>
          </div>
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
          <Field label="Meta title">
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Leave empty to use the page's default title"
              maxLength={70}
              className="mg-input"
            />
            <span
              className={
                "mt-1 block text-right font-mono text-xs " +
                (metaTitle.length > 60
                  ? "text-amber-400"
                  : metaTitle.length === 0
                  ? "text-chrome-700"
                  : "text-chrome-500")
              }
            >
              {metaTitle.length}/70
            </span>
          </Field>

          <Field label="Meta description">
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Leave empty to use the page's default description"
              maxLength={200}
              className="mg-input resize-y"
            />
            <span
              className={
                "mt-1 block text-right font-mono text-xs " +
                (metaDescription.length > 160
                  ? "text-amber-400"
                  : metaDescription.length === 0
                  ? "text-chrome-700"
                  : "text-chrome-500")
              }
            >
              {metaDescription.length}/200
            </span>
          </Field>

          <Field label="Keywords (comma-separated)">
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="e.g. custom software, field service software, Johannesburg"
              className="mg-input"
            />
          </Field>

          {/* Google snippet preview */}
          <div className="flex flex-col gap-1 rounded-[var(--radius-mg)] border border-hairline bg-white p-4">
            <span className="text-xs text-emerald-700">{site.url.replace(/^https?:\/\//, "")}{page.path}</span>
            <span className="truncate text-lg text-[#1a0dab]">
              {metaTitle.trim() || "Page title will appear here"}
            </span>
            <span className="line-clamp-2 text-sm text-[#4d5156]">
              {metaDescription.trim() || "Page description will appear here."}
            </span>
          </div>

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
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save
            </button>
          </div>
        </div>
      </div>
    </dialog>
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