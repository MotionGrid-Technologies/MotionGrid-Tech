import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/api-auth";
import { fetchPageSeo } from "@/lib/seo-fetcher";

// Fetches live SEO data for a public route so the admin SEO scorer can grade
// real pages instead of a stale registry. Guards against path traversal.
export async function GET(request: Request) {
  const guardResponse = await guardAdminRequest(request);
  if (guardResponse) return guardResponse;

  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "";

  if (!path.startsWith("/") || path.startsWith("//")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const origin = url.origin;
    const data = await fetchPageSeo(path, origin);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[seo] fetch page failed", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}