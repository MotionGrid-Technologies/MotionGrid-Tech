"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

// ---------------------------------------------------------------------------
// SEO scorer for published blog posts AND live public pages.
//
//   - Blog posts: graded from their stored Supabase fields (source of truth).
//   - Public pages: the chosen route's HTML is fetched live via
//     /api/admin/seo/fetch-page?path=... and graded from real server output,
//     so scores can never drift from what's actually being served.
// Scoring runs client-side (DOMParser / fetched metrics) — no heavy parsing.
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

export interface SeoPage {
  id: string;
  path: string;
  label: string;
}

type Mode = "blog" | "page";

interface SeoAuditable {
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
}

interface ParsedMetrics {
  h1Count: number;
  h2Count: number;
  headingText: string;
  wordCount: number;
  firstParagraph: string;
  imgTotal: number;
  imgWithAlt: number;
}

type Level = "pass" | "warn" | "fail";

interface SeoCheck {
  key: string;
  label: string;
  status: Level;
  points: number;
  outOf: number;
  detail: string;
  suggestion?: string;
}

interface ScoreResult {
  checks: SeoCheck[];
  total: number;
  max: number;
  grade: string;
  suggestions: string[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "with", "from", "your", "our",
  "how", "to", "of", "in", "on", "at", "by", "is", "are", "be", "can", "you",
  "why", "what", "when", "this", "that", "it", "we", "not", "into", "using",
]);

export function deriveDefaultKeyword(title: string): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return words[0] ?? title.trim().split(/\s+/)[0] ?? "";
}

function statusColor(status: Level): string {
  if (status === "pass") return "text-emerald-400 border-emerald-400/40";
  if (status === "warn") return "text-amber-400 border-amber-400/40";
  return "text-red-400 border-red-400/40";
}

function parseContentHtml(html: string): ParsedMetrics {
  let h1Count = 0;
  let h2Count = 0;
  let imgTotal = 0;
  let imgWithAlt = 0;
  let wordCount = 0;
  let firstParagraph = "";
  let headingText = "";

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    h1Count = doc.querySelectorAll("h1").length;
    h2Count = doc.querySelectorAll("h2").length;
    const imgs = doc.querySelectorAll("img");
    imgTotal = imgs.length;
    imgWithAlt = [...imgs].filter(
      (i) => (i.getAttribute("alt") || "").trim().length > 0
    ).length;
    const bodyText = doc.body ? doc.body.innerText || "" : "";
    wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).filter(Boolean).length : 0;
    firstParagraph = (doc.querySelector("p")?.textContent || "").trim();
    headingText = [...doc.querySelectorAll("h2, h3")]
      .map((h) => h.textContent || "")
      .join(" ");
  } catch {
    // Content isn't valid HTML — grade as-is with zeroed parse metrics.
  }

  return { h1Count, h2Count, headingText, wordCount, firstParagraph, imgTotal, imgWithAlt };
}

export function scoreSeo(
  record: SeoAuditable,
  keyword: string,
  parsed?: ParsedMetrics
): ScoreResult {
  const metaTitle = record.meta_title?.trim() || record.title.trim();
  const metaDescription = (record.meta_description || "").trim();
  const kw = keyword.trim().toLowerCase();

  const metrics = parsed ?? parseContentHtml(record.content);
  const { h1Count, h2Count, headingText, wordCount, firstParagraph, imgTotal, imgWithAlt } = metrics;

  const includes = (source: string) => source.toLowerCase().includes(kw);

  const checks: SeoCheck[] = [];

  // Title length (15)
  {
    const len = metaTitle.length;
    let status: Level = "pass";
    let points = 15;
    let detail = `${len} characters.`;
    if (len < 30 || len > 65) {
      status = "fail";
      points = 0;
      detail = `${len} characters — aim for 50–60.`;
    } else if (len < 40 || len > 60) {
      status = "warn";
      points = 8;
      detail = `${len} characters — aim for 50–60.`;
    }
    checks.push({
      key: "title",
      label: "Title length",
      status,
      points,
      outOf: 15,
      detail,
      suggestion: "Keep the title between 50–60 characters so it isn't truncated in results.",
    });
  }

  // Meta description (15)
  {
    const len = metaDescription.length;
    if (!metaDescription) {
      checks.push({
        key: "metaDescription",
        label: "Meta description",
        status: "fail",
        points: 0,
        outOf: 15,
        detail: "Not set — search engines will fall back to body text.",
        suggestion: "Write a meta description between 120–160 characters.",
      });
    } else if (len < 120 || len > 160) {
      checks.push({
        key: "metaDescription",
        label: "Meta description",
        status: len < 70 || len > 200 ? "fail" : "warn",
        points: len < 70 || len > 200 ? 0 : 8,
        outOf: 15,
        detail: `${len} characters — aim for 120–160.`,
        suggestion: "Adjust the meta description to 120–160 characters.",
      });
    } else {
      checks.push({
        key: "metaDescription",
        label: "Meta description",
        status: "pass",
        points: 15,
        outOf: 15,
        detail: `${len} characters — within range.`,
      });
    }
  }

  // Heading structure (15)
  {
    const h1Points = h1Count === 1 ? 8 : 0;
    const h2Points = h2Count >= 1 ? 7 : 0;
    checks.push({
      key: "headings",
      label: "Heading structure",
      status: h1Points === 8 && h2Points === 7 ? "pass" : h1Points === 8 ? "warn" : "fail",
      points: h1Points + h2Points,
      outOf: 15,
      detail: `${h1Count} H1, ${h2Count} H2.`,
      suggestion:
        h1Count !== 1
          ? "Use exactly one H1 for the page."
          : h2Count === 0
          ? "Add H2 subheadings to break the page into scannable sections."
          : undefined,
    });
  }

  // Content length (20)
  {
    let status: Level = "pass";
    let points = 20;
    if (wordCount < 300) {
      status = "fail";
      points = 0;
    } else if (wordCount < 600) {
      status = "warn";
      points = 12;
    }
    checks.push({
      key: "contentLength",
      label: "Content length",
      status,
      points,
      outOf: 20,
      detail: `${wordCount} words.`,
      suggestion:
        wordCount < 300
          ? "Aim for at least 300 words (600+ is better) to rank for competitive topics."
          : wordCount < 600
          ? "Expand toward 600+ words for stronger topical coverage."
          : undefined,
    });
  }

  // Keyword usage (15)
  {
    const inTitle = kw ? includes(metaTitle) : false;
    const inDesc = kw ? includes(metaDescription) : false;
    const inFirst = kw ? includes(firstParagraph) : false;
    const inHeading = kw ? includes(headingText) : false;
    const pts = (inTitle ? 4 : 0) + (inDesc ? 4 : 0) + (inFirst ? 4 : 0) + (inHeading ? 3 : 0);
    checks.push({
      key: "keyword",
      label: "Keyword usage",
      status: pts === 15 ? "pass" : pts >= 8 ? "warn" : "fail",
      points: pts,
      outOf: 15,
      detail: kw
        ? `Title ${inTitle ? "✓" : "✗"} · Desc ${inDesc ? "✓" : "✗"} · Intro ${inFirst ? "✓" : "✗"} · H2 ${inHeading ? "✓" : "✗"}`
        : "No keyword entered.",
      suggestion: kw
        ? "Include the keyword in the title, meta description, first paragraph, and at least one H2."
        : "Enter a target keyword to check placement.",
    });
  }

  // Image alt coverage (10)
  {
    const altRatio = imgTotal > 0 ? Math.round((imgWithAlt / imgTotal) * 100) : 100;
    let status: Level = "pass";
    let points = 10;
    const detail =
      imgTotal === 0
        ? "No images on page."
        : `${imgWithAlt}/${imgTotal} images have alt text (${altRatio}%).`;
    if (imgTotal > 0 && imgWithAlt < imgTotal) {
      status = imgWithAlt === 0 ? "fail" : "warn";
      points = imgWithAlt === 0 ? 0 : 5;
    }
    checks.push({
      key: "images",
      label: "Image alt text",
      status,
      points,
      outOf: 10,
      detail,
      suggestion:
        imgTotal > 0 && imgWithAlt < imgTotal
          ? "Add descriptive alt text to every image for accessibility and image SEO."
          : undefined,
    });
  }

  // Excerpt (5)
  {
    const hasExcerpt = Boolean((record.excerpt || "").trim());
    checks.push({
      key: "excerpt",
      label: "Excerpt",
      status: hasExcerpt ? "pass" : "fail",
      points: hasExcerpt ? 5 : 0,
      outOf: 5,
      detail: hasExcerpt ? "Present." : "Missing.",
      suggestion: hasExcerpt
        ? undefined
        : "Add a 1–2 sentence summary — used on cards and shared snippets.",
    });
  }

  // Slug quality (5)
  {
    const clean = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) && record.slug.length <= 80;
    checks.push({
      key: "slug",
      label: "Slug",
      status: clean ? "pass" : "warn",
      points: clean ? 5 : 2,
      outOf: 5,
      detail: `/${record.slug}`,
      suggestion: clean
        ? undefined
        : "Use a short lowercase slug with hyphens (≤80 chars).",
    });
  }

  const total = checks.reduce((sum, c) => sum + c.points, 0);
  const grade = total >= 85 ? "A" : total >= 70 ? "B" : total >= 55 ? "C" : total >= 40 ? "D" : "F";

  return {
    checks,
    total,
    max: 100,
    grade,
    suggestions: checks
      .filter((c) => c.status !== "pass" && c.suggestion)
      .map((c) => c.suggestion!),
  };
}

export function SeoScorer({ posts, pages }: { posts: SeoPost[]; pages: SeoPage[] }) {
  const [mode, setMode] = useState<Mode>(posts.length > 0 ? "blog" : "page");
  const [selectedPostId, setSelectedPostId] = useState(posts[0]?.id ?? "");
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id ?? "");
  const [keywordOverride, setKeywordOverride] = useState<string | null>(null);
  const [live, setLive] = useState<{
    path: string;
    record: SeoAuditable;
    parsed: ParsedMetrics;
  } | null>(null);
  const [fetchError, setFetchError] = useState<{ path: string; message: string } | null>(null);

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;
  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  useEffect(() => {
    if (mode !== "page" || !selectedPage) return;
    const path = selectedPage.path;
    let cancelled = false;
    fetch(`/api/admin/seo/fetch-page?path=${encodeURIComponent(path)}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to fetch page");
        setLive({
          path,
          record: {
            title: data.title,
            slug: path.replace(/^\//, ""),
            excerpt: data.bodyText ? data.bodyText.slice(0, 150) : null,
            meta_title: data.title,
            meta_description: data.metaDescription,
            content: data.bodyText,
          },
          parsed: {
            h1Count: data.h1Count,
            h2Count: data.h2Count,
            headingText: data.headingText,
            wordCount: data.wordCount,
            firstParagraph: data.firstParagraph,
            imgTotal: data.imgTotal,
            imgWithAlt: data.imgWithAlt,
          },
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setFetchError({
          path,
          message: e instanceof Error ? e.message : "Failed to fetch page",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [mode, selectedPage]);

  const blogRecord: SeoAuditable | null = selectedPost
    ? {
        title: selectedPost.title,
        slug: selectedPost.slug,
        excerpt: selectedPost.excerpt,
        meta_title: selectedPost.meta_title,
        meta_description: selectedPost.meta_description,
        content: selectedPost.content,
      }
    : null;

  const pageRecord = selectedPage && live?.path === selectedPage.path ? live.record : null;
  const pageParsed = selectedPage && live?.path === selectedPage.path ? live.parsed : undefined;
  const pageLoading =
    mode === "page" &&
    !!selectedPage &&
    live?.path !== selectedPage.path &&
    fetchError?.path !== selectedPage.path;
  const pageError =
    mode === "page" && fetchError && fetchError.path === selectedPage?.path
      ? fetchError.message
      : null;

  const record = mode === "blog" ? blogRecord : pageRecord;
  const currentTitle = record?.title ?? "";
  const keyword = keywordOverride ?? deriveDefaultKeyword(currentTitle);

  const result = useMemo(
    () => (record ? scoreSeo(record, keyword, pageParsed) : null),
    [record, keyword, pageParsed]
  );

  function handleMode(next: Mode) {
    setMode(next);
    setKeywordOverride(null);
  }

  function handleSelect(id: string) {
    if (mode === "blog") {
      setSelectedPostId(id);
    } else {
      setSelectedPageId(id);
    }
    setKeywordOverride(null);
  }

  const currentLabel = mode === "blog" ? selectedPost?.title ?? "" : selectedPage?.label ?? "";

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2" role="tablist" aria-label="SEO target type">
        <ModeTab active={mode === "blog"} onClick={() => handleMode("blog")} label="Blog posts" />
        <ModeTab active={mode === "page"} onClick={() => handleMode("page")} label="Public pages" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="mg-eyebrow">{mode === "blog" ? "Post" : "Page"}</span>
          <select
            value={mode === "blog" ? selectedPostId : selectedPageId}
            onChange={(e) => handleSelect(e.target.value)}
            className="mg-input"
          >
            {mode === "blog"
              ? posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))
              : pages.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.label}
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

      {pageLoading ? (
        <div className="flex min-h-[200px] items-center justify-center gap-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
          <Loader2 size={18} className="animate-spin text-signal" />
          <p className="text-sm text-chrome-500">Fetching live page…</p>
        </div>
      ) : pageError ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[var(--radius-mg-lg)] border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-400">{pageError}</p>
        </div>
      ) : !record || !result ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
          <p className="text-sm text-chrome-700">
            {mode === "blog"
              ? "Publish a blog post first to run the SEO scorer."
              : "Select a public page to score it."}
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
              <span className="text-sm text-chrome-500">{currentLabel}</span>
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

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[var(--radius-mg)] border px-4 py-2.5 text-sm transition-colors ${
        active
          ? "border-signal/60 bg-graphite text-chrome-100"
          : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
      }`}
    >
      {label}
    </button>
  );
}