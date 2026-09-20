"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info, Loader2, RotateCcw, Save, Search, X } from "lucide-react";
import { site } from "@/lib/site";
import type { PageSeoOverride } from "@/lib/page-seo-store";
import type { PageSeoData } from "@/lib/seo-fetcher";
import { deriveDefaultKeyword, scoreSeo } from "@/lib/seo-scorer";

interface PageSeoModalProps {
  page: { path: string; label: string };
  override: PageSeoOverride | null;
  liveData: PageSeoData | null;
  onClose: () => void;
  onSaved: (override: PageSeoOverride) => void;
}

export function PageSeoModal({ page, override, liveData, onClose, onSaved }: PageSeoModalProps) {
  // Pre-fill with the override if one exists, otherwise fall back to the live
  // values currently being served so the form is never blank.
  const defaultTitle = override?.meta_title ?? liveData?.title ?? "";
  const defaultDescription = override?.meta_description ?? liveData?.metaDescription ?? "";
  const defaultKeywords = override?.meta_keywords ?? "";

  const [metaTitle, setMetaTitle] = useState(defaultTitle);
  const [metaDescription, setMetaDescription] = useState(defaultDescription);
  const [metaKeywords, setMetaKeywords] = useState(defaultKeywords);
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

  const titleValidation = useMemo(() => {
    const len = metaTitle.length;
    if (len < 50) return { text: "Title is too short — aim for 50–60 characters.", status: "warn" as const };
    if (len > 60) return { text: "Title is too long — may be truncated in search results.", status: "warn" as const };
    return { text: "Good length.", status: "pass" as const };
  }, [metaTitle]);

  const descriptionValidation = useMemo(() => {
    const len = metaDescription.length;
    if (len < 120) return { text: "Description is too short — aim for 120–160 characters.", status: "warn" as const };
    if (len > 160) return { text: "Description is too long — may be truncated.", status: "warn" as const };
    return { text: "Good length.", status: "pass" as const };
  }, [metaDescription]);

  const dynamicSuggestions = useMemo(() => {
    if (!liveData) return [];
    const keyword = deriveDefaultKeyword(metaTitle || liveData.title);
    const record = {
      title: liveData.title,
      slug: page.path.replace(/^\//, ""),
      excerpt: liveData.bodyText ? liveData.bodyText.slice(0, 150) : null,
      meta_title: metaTitle,
      meta_description: metaDescription,
      content: liveData.bodyText,
    };
    const parsed = {
      h1Count: liveData.h1Count,
      h2Count: liveData.h2Count,
      headingText: liveData.headingText,
      wordCount: liveData.wordCount,
      firstParagraph: liveData.firstParagraph,
      imgTotal: liveData.imgTotal,
      imgWithAlt: liveData.imgWithAlt,
    };
    return scoreSeo(record, keyword, parsed).suggestions;
  }, [metaTitle, metaDescription, liveData, page.path]);

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

  function resetToLive() {
    setMetaTitle(liveData?.title ?? "");
    setMetaDescription(liveData?.metaDescription ?? "");
    setMetaKeywords("");
  }

  const snippetUrl = `${site.url.replace(/^https?:\/\//, "")}${page.path}`;

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
        className="max-h-[90vh] w-full overflow-y-auto rounded-[var(--radius-mg-lg)] border border-hairline bg-obsidian-soft p-6 shadow-2xl"
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
            <div className="mt-1 flex items-center justify-between">
              <span
                className={
                  "text-xs " +
                  (titleValidation.status === "pass" ? "text-emerald-400" : "text-amber-400")
                }
              >
                {titleValidation.text}
              </span>
              <span
                className={
                  "font-mono text-xs " +
                  (metaTitle.length > 60
                    ? "text-amber-400"
                    : metaTitle.length === 0
                    ? "text-chrome-700"
                    : "text-chrome-500")
                }
              >
                {metaTitle.length}/70
              </span>
            </div>
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
            <div className="mt-1 flex items-center justify-between">
              <span
                className={
                  "text-xs " +
                  (descriptionValidation.status === "pass" ? "text-emerald-400" : "text-amber-400")
                }
              >
                {descriptionValidation.text}
              </span>
              <span
                className={
                  "font-mono text-xs " +
                  (metaDescription.length > 160
                    ? "text-amber-400"
                    : metaDescription.length === 0
                    ? "text-chrome-700"
                    : "text-chrome-500")
                }
              >
                {metaDescription.length}/200
              </span>
            </div>
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
            <span className="text-xs text-emerald-700">{snippetUrl}</span>
            <span className="truncate text-lg text-[#1a0dab]">
              {metaTitle.trim() || "Page title will appear here"}
            </span>
            <span className="line-clamp-2 text-sm text-[#4d5156]">
              {metaDescription.trim() || "Page description will appear here."}
            </span>
          </div>

          {/* Tips */}
          <div className="flex flex-col gap-3 rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 p-5">
            <span className="mg-eyebrow flex items-center gap-1.5">
              <Info size={13} /> Tips
            </span>
            <ul className="flex flex-col gap-2">
              {[
                "Include your target keyword near the start of the title.",
                "Write a unique description that summarizes the page content.",
                "Avoid keyword stuffing in the keywords field.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-chrome-500">
                  <Search size={14} className="mt-0.5 shrink-0 text-signal" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic suggestions */}
          {dynamicSuggestions.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-mg)] border border-amber-500/20 bg-amber-500/5 p-5">
              <span className="mg-eyebrow text-amber-400">Suggested improvements</span>
              <ul className="flex flex-col gap-2">
                {dynamicSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-chrome-500">
                    <Search size={14} className="mt-0.5 shrink-0 text-amber-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-1 flex justify-between gap-2">
            <button
              type="button"
              onClick={resetToLive}
              disabled={!liveData}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-4 py-2 text-sm text-chrome-300 hover:border-chrome-500 hover:text-chrome-100 disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset to live default
            </button>
            <div className="flex gap-2">
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
