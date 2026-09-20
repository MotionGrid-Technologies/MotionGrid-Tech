import { load } from "cheerio";

// Fetches a live public route and extracts the on-page SEO signals used by the
// admin SEO scorer. Content is scoped to <main> so nav/footer markup never
// inflates heading or word-count metrics.

export interface PageSeoData {
  path: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  headingText: string;
  wordCount: number;
  firstParagraph: string;
  imgTotal: number;
  imgWithAlt: number;
  bodyText: string;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function fetchPageSeo(path: string, origin: string): Promise<PageSeoData> {
  const url = new URL(path, origin);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: HTTP ${res.status}`);
  }
  const html = await res.text();

  const $ = load(html);
  const main = $("main").length ? $("main") : $("body");
  main.find("script, style").remove();

  const title = normalizeText($("title").first().text()) || normalizeText(main.find("h1").first().text());
  const metaDescription = normalizeText($('meta[name="description"]').attr("content") ?? "");
  const h1Count = main.find("h1").length;
  const h2Count = main.find("h2").length;
  const headingText = main
    .find("h2, h3")
    .map((_, el) => $(el).text())
    .get()
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
  const bodyText = normalizeText(main.text());
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const firstParagraph = normalizeText(main.find("p").first().text());
  const images = main.find("img");
  const imgTotal = images.length;
  const imgWithAlt = images.filter((_, el) => normalizeText($(el).attr("alt") ?? "").length > 0).length;

  return {
    path,
    title,
    metaDescription,
    h1Count,
    h2Count,
    headingText,
    wordCount,
    firstParagraph,
    imgTotal,
    imgWithAlt,
    bodyText,
  };
}