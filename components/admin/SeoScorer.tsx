"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  deriveDefaultKeyword,
  scoreSeo,
  type Level,
  type SeoAuditable,
} from "@/lib/seo-scorer";

// ---------------------------------------------------------------------------
// SEO scorer for published blog posts. Grades the post's stored fields via the
// shared scoring engine in lib/seo-scorer.ts. Public pages have their own
// table UI (PageSeoTable) on the same admin page.
// ---------------------------------------------------------------------------

export interface SeoPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
}

function statusColor(status: Level): string {
  if (status === "pass") return "text-emerald-400 border-emerald-400/40";
  if (status === "warn") return "text-amber-400 border-amber-400/40";
  return "text-red-400 border-red-400/40";
}

export function SeoScorer({ posts }: { posts: SeoPost[] }) {
  const [selectedId, setSelectedId] = useState<string>(posts[0]?.id ?? "");
  const [keywordOverride, setKeywordOverride] = useState<string | null>(null);

  const selected = posts.find((p) => p.id === selectedId) ?? null;

  const keyword =
    keywordOverride ?? (selected ? deriveDefaultKeyword(selected.title) : "");

  const result = useMemo(() => {
    if (!selected) return null;
    const record: SeoAuditable = {
      title: selected.title,
      slug: selected.slug,
      excerpt: selected.excerpt,
      meta_title: selected.meta_title,
      meta_description: selected.meta_description,
      content: selected.content,
    };
    return scoreSeo(record, keyword);
  }, [selected, keyword]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setKeywordOverride(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="mg-eyebrow">Post</span>
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            className="mg-input"
          >
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="mg-eyebrow">Target keyword</span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeywordOverride(e.target.value)}
            placeholder="Keyword (defaults from title)"
            className="mg-input"
          />
        </label>
      </div>

      {!selected || !result ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
          <p className="text-sm text-chrome-700">
            Publish a blog post first to run the SEO scorer.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Score banner */}
          <div className="flex flex-wrap items-center gap-6 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6">
            <div className="flex flex-col items-center">
              <span
                className={
                  "font-display text-6xl " +
                  (result.total >= 85
                    ? "text-emerald-400"
                    : result.total >= 55
                    ? "text-amber-400"
                    : "text-red-400")
                }
              >
                {result.total}
              </span>
              <span className="text-xs text-chrome-700">/ 100</span>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="font-display text-2xl text-chrome-100">
                Grade {result.grade}
              </span>
              <span className="text-sm text-chrome-500">
                {selected.meta_title || selected.title}
              </span>
              {result.suggestions.length > 0 && (
                <span className="mt-1 text-xs text-amber-400">
                  {result.suggestions.length} improvement
                  {result.suggestions.length === 1 ? "" : "s"} suggested
                </span>
              )}
            </div>
          </div>

          {/* Per-check breakdown */}
          <div className="flex flex-col divide-y divide-hairline overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
            {result.checks.map((c) => (
              <div key={c.key} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-3 sm:w-64">
                  <span
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs " +
                      statusColor(c.status)
                    }
                  >
                    {c.status === "pass" ? "✓" : c.status === "warn" ? "!" : "✗"}
                  </span>
                  <span className="text-sm text-chrome-100">{c.label}</span>
                </div>
                <span className="flex-1 text-xs text-chrome-500">{c.detail}</span>
                <span
                  className={
                    "font-mono text-sm " +
                    (c.points >= c.outOf
                      ? "text-emerald-400"
                      : c.points === 0
                      ? "text-red-400"
                      : "text-amber-400")
                  }
                >
                  {c.points}/{c.outOf}
                </span>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
              <span className="mg-eyebrow">Actionable improvements</span>
              <ul className="flex flex-col gap-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-chrome-500">
                    <Search size={14} className="mt-0.5 shrink-0 text-signal" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}