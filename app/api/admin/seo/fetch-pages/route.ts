import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/api-auth";
import { fetchPageSeo } from "@/lib/seo-fetcher";

// Bulk fetch live SEO data for multiple public routes in parallel.
// Used by the admin SEO table's "Refresh all" action.
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

  if (paths.some((p) => !p.startsWith("/") || p.startsWith("//"))) {
    return NextResponse.json({ error: "Invalid path in paths" }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const results = await Promise.all(
      paths.map(async (path) => {
        try {
          const data = await fetchPageSeo(path, origin);
          return { path, data };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch page";
          return { path, error: message };
        }
      })
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[seo] bulk fetch failed", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
