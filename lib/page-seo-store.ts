import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Page SEO overrides. Admin-managed metadata overrides for public routes,
// merged into each page's generateMetadata. Server-only access via the
// service role (RLS has no permissive policies).
// ---------------------------------------------------------------------------

const SITE_SUPABASE_URL = process.env.SITE_SUPABASE_URL;
const SITE_SUPABASE_SERVICE_ROLE_KEY = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;

function createSiteClient() {
  if (!SITE_SUPABASE_URL || !SITE_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "MotionGrid Supabase is not configured. Set SITE_SUPABASE_URL and " +
        "SITE_SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
  }
  return createClient<Database>(SITE_SUPABASE_URL, SITE_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export type PageSeoOverride = {
  id: string;
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
};

type PageSeoRow = Database["public"]["Tables"]["page_seo"]["Row"];

function mapRow(row: PageSeoRow): PageSeoOverride {
  return {
    id: row.id,
    path: row.path,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    meta_keywords: row.meta_keywords ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listPageSeo(): Promise<PageSeoOverride[]> {
  const { data, error } = await createSiteClient()
    .from("page_seo")
    .select("*")
    .order("path", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getPageSeo(path: string): Promise<PageSeoOverride | null> {
  const { data, error } = await createSiteClient()
    .from("page_seo")
    .select("*")
    .eq("path", path)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function upsertPageSeo(
  path: string,
  input: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
  }
): Promise<PageSeoOverride> {
  const { data, error } = await createSiteClient()
    .from("page_seo")
    .upsert(
      {
        path,
        meta_title: input.metaTitle?.trim() ? input.metaTitle.trim() : null,
        meta_description: input.metaDescription?.trim()
          ? input.metaDescription.trim()
          : null,
        meta_keywords: input.metaKeywords?.trim() ? input.metaKeywords.trim() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "path" }
    )
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}