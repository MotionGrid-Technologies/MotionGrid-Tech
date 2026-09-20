import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAdminRequest } from "@/lib/api-auth";
import { listPageSeo, upsertPageSeo } from "@/lib/page-seo-store";

const UpsertSchema = z.object({
  path: z.string().min(1).max(200),
  metaTitle: z.string().max(300).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
});

export async function GET(request: Request) {
  const guardResponse = await guardAdminRequest(request);
  if (guardResponse) return guardResponse;

  try {
    const overrides = await listPageSeo();
    return NextResponse.json({ overrides });
  } catch (error) {
    console.error("[page-seo] list failed", error);
    return NextResponse.json({ error: "Failed to list overrides" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guardResponse = await guardAdminRequest(request);
  if (guardResponse) return guardResponse;

  try {
    const body = UpsertSchema.parse(await request.json());
    const override = await upsertPageSeo(body.path, {
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      metaKeywords: body.metaKeywords ?? null,
    });
    return NextResponse.json({ override });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("[page-seo] upsert failed", error);
    return NextResponse.json({ error: "Failed to save override" }, { status: 500 });
  }
}