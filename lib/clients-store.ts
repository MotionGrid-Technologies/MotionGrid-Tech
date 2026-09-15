import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";

// ---------------------------------------------------------------------------
// MotionGrid clients store (admin). Reads/writes go through the cookie-based
// server client so RLS (admin-only policies) is enforced.
// ---------------------------------------------------------------------------

export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  slug: string;
  created_at: string;
}

// Deterministic, URL-safe slug from the company (falling back to the contact
// name). Shared with lib/meetings-store.ts for public booking find-or-create.
export function buildClientSlug(company: string, name: string): string {
  const base = (company.trim() || name.trim() || "client")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "client";
}

export async function listClients(): Promise<ClientRecord[]> {
  const supabase = await createSiteSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, company, email, phone, slug, created_at")
    .order("company", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ClientRecord[];
}

export async function createClient(input: {
  name: string;
  company: string;
  email: string;
  phone?: string;
}): Promise<ClientRecord> {
  const supabase = await createSiteSupabaseServerClient();

  const slug = buildClientSlug(input.company, input.name);

  // A client may be re-added (e.g. same company, new contact). If the slug is
  // taken we disambiguate with a short random suffix instead of failing.
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone || null,
      slug: finalSlug,
    })
    .select("id, name, company, email, phone, slug, created_at")
    .single();

  if (error) throw error;
  return data as ClientRecord;
}
