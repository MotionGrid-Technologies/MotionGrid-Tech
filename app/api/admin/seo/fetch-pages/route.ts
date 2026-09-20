import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/api-auth";
import { fetchPageSeo } from "@/lib/seo-fetcher";
import { isSameOriginPath, mapInBatches } from "@/lib/seo-fetch-paths";

const TRUSTED_ORIGIN = "https://motiongrid.co.za";
const FETCH_CONCURRENCY = 5;

/** Bulk-fetches live SEO data for the admin table's requested public routes. */
export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest(request);
  if (guardResponse) return guardResponse;

  let paths: unknown;
  try {
    const body = await request.json();
    paths = body.paths;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(paths) || paths.some((p) => typeof p !== "string")) {
    return NextResponse.json({ error: "paths must be an array of strings" }, { status: 400 });
  }

  if (paths.some((path) => !isSameOriginPath(path, TRUSTED_ORIGIN))) {
    return NextResponse.json({ error: "Invalid path in paths" }, { status: 400 });
  }

  try {
    const uniquePaths = [...new Set(paths)];
    const results = await mapInBatches(
      uniquePaths,
      FETCH_CONCURRENCY,
      async (path) => {
        try {
          const data = await fetchPageSeo(path, TRUSTED_ORIGIN);
          return { path, data };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch page";
          return { path, error: message };
        }
      }
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[seo] bulk fetch failed", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
