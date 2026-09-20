// Shared on-page SEO scoring engine. Used by both the blog-post SEO scorer
// and the public-pages SEO table. Pure functions + browser DOMParser — runs
// client-side only (these components are "use client").

export interface SeoAuditable {
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
}

export interface ParsedMetrics {
  h1Count: number;
  h2Count: number;
  headingText: string;
  wordCount: number;
  firstParagraph: string;
  imgTotal: number;
  imgWithAlt: number;
}

export type Level = "pass" | "warn" | "fail";

export interface SeoCheck {
  key: string;
  label: string;
  status: Level;
  points: number;
  outOf: number;
  detail: string;
  suggestion?: string;
}

export interface ScoreResult {
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

export function parseContentHtml(html: string): ParsedMetrics {
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