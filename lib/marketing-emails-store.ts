import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// MotionGrid marketing email store. Drafts live in MotionGrid's own Supabase
// (SITE_SUPABASE_*), separate from the Autofield multi-tenant project.
// Server-only access via the service role (RLS has no permissive policies).
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

export type MarketingEmailStatus = "draft" | "sent";

type MarketingEmailRow = Database["public"]["Tables"]["marketing_emails"]["Row"];

function parseMarketingEmailStatus(status: MarketingEmailRow["status"]): MarketingEmailStatus {
  if (status === "draft" || status === "sent") return status;
  throw new Error(`Unsupported marketing email status: ${status}`);
}

function mapMarketingEmail(row: MarketingEmailRow): MarketingEmail {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    html_body: row.html_body,
    text_body: row.text_body,
    status: parseMarketingEmailStatus(row.status),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type MarketingEmail = {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  status: MarketingEmailStatus;
  created_at: string;
  updated_at: string;
};

export async function listMarketingEmails(
  limit = 50,
  offset = 0
): Promise<MarketingEmail[]> {
  const { data, error } = await createSiteClient()
    .from("marketing_emails")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data ?? []).map(mapMarketingEmail);
}

export async function getMarketingEmail(id: string): Promise<MarketingEmail | null> {
  const { data, error } = await createSiteClient()
    .from("marketing_emails")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapMarketingEmail(data);
}

export async function createMarketingEmail(input: {
  name: string;
  subject: string;
  html_body: string;
  text_body?: string | null;
}): Promise<MarketingEmail> {
  const { data, error } = await createSiteClient()
    .from("marketing_emails")
    .insert({
      name: input.name,
      subject: input.subject,
      html_body: input.html_body,
      text_body: input.text_body ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapMarketingEmail(data);
}

export async function updateMarketingEmail(
  id: string,
  input: {
    name?: string;
    subject?: string;
    html_body?: string;
    text_body?: string | null;
    status?: MarketingEmailStatus;
  }
): Promise<boolean> {
  const { data, error } = await createSiteClient()
    .from("marketing_emails")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function deleteMarketingEmail(id: string): Promise<boolean> {
  const { data, error } = await createSiteClient()
    .from("marketing_emails")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
