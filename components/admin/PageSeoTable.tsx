"use client";

import { useState } from "react";
import { Eye, Loader2, Pencil, Search } from "lucide-react";
import { deriveDefaultKeyword, scoreSeo, type ScoreResult } from "@/lib/seo-scorer";
import { PageSeoModal } from "@/components/admin/PageSeoModal";
import type { PageSeoOverride } from "@/lib/page-seo-store";

export interface SeoPage {
  id: string;
  path: string;
  label: string;
}

interface PageSeoTableProps {
  pages: SeoPage[];
  overrides: PageSeoOverride[];
}

type ScoreEntry = { result: ScoreResult; keyword: string };

function scoreColor(total: number): string {
  if (total >= 85) return "text-emerald-400";
  if (total >= 55) return "text-amber-400";
  return "text-red-400";
}

export function PageSeoTable({ pages, overrides: initialOverrides }: PageSeoTableProps) {
  const [overrides, setOverrides] = useState<PageSeoOverride[]>(initialOverrides);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
  const [scoringPath, setScoringPath] = useState<string | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [editing, setEditing] = useState<{
    page: { path: string; label: string };
    override: PageSeoOverride | null;
  } | null>(null);

  function overrideFor(path: string): PageSeoOverride | null {
    return overrides.find((o) => o.path === path) ?? null;
  }

  async function handleScore(path: string) {
    setScoringPath(path);
    setScoreError(null);
    try {
      const res = await fetch(`/api/admin/seo/fetch-page?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch page");

      const record = {
        title: data.title,
        slug: path.replace(/^\//, ""),
        excerpt: data.bodyText ? data.bodyText.slice(0, 150) : null,
        meta_title: data.title,
        meta_description: data.metaDescription,
        content: data.bodyText,
      };
      const parsed = {
        h1Count: data.h1Count,
        h2Count: data.h2Count,
        headingText: data.headingText,
        wordCount: data.wordCount,
        firstParagraph: data.firstParagraph,
        imgTotal: data.imgTotal,
        imgWithAlt: data.imgWithAlt,
      };
      const keyword = deriveDefaultKeyword(data.title);
      setScores((prev) => ({
        ...prev,
        [path]: { result: scoreSeo(record, keyword, parsed), keyword },
      }));
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : "Failed to fetch page");
    } finally {
      setScoringPath(null);
    }
  }

  function handleSaved(override: PageSeoOverride) {
    setOverrides((prev) => {
      const existing = prev.findIndex((o) => o.path === override.path);
      if (existing === -1) return [...prev, override];
      const next = [...prev];
      next[existing] = override;
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wider text-chrome-700">
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Path</th>
              <th className="px-4 py-3 font-medium">Override title</th>
              <th className="px-4 py-3 font-medium">Override description</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {pages.map((page) => {
              const override = overrideFor(page.path);
              const score = scores[page.path];
              const scoring = scoringPath === page.path;
              return (
                <tr key={page.id} className="hover:bg-graphite/40">
                  <td className="px-4 py-3 font-medium text-chrome-100">{page.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-chrome-500">{page.path}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-chrome-300">
                    {override?.meta_title || "—"}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-chrome-500">
                    {override?.meta_description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {score ? (
                      <span className="inline-flex items-center gap-2">
                        <span className={"font-display text-xl " + scoreColor(score.result.total)}>
                          {score.result.total}
                        </span>
                        <span className="text-xs text-chrome-700">Grade {score.result.grade}</span>
                      </span>
                    ) : scoring ? (
                      <Loader2 size={16} className="animate-spin text-signal" />
                    ) : (
                      <span className="text-chrome-700">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleScore(page.path)}
                        disabled={scoring}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100 disabled:opacity-50"
                      >
                        <Search size={13} />
                        {score ? "Re-score" : "Score"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({ page: { path: page.path, label: page.label }, override })
                        }
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-signal/30 px-3 py-1.5 text-xs text-signal hover:border-signal"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {scoreError && (
        <p className="rounded-[var(--radius-mg)] border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {scoreError}
        </p>
      )}

      <p className="flex items-center gap-2 text-xs text-chrome-700">
        <Eye size={13} /> Scores are fetched live from each route&apos;s served HTML.
      </p>

      {editing && (
        <PageSeoModal
          page={editing.page}
          override={editing.override}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}