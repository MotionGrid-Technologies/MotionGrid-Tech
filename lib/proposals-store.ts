import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";

export type ProposalStatus = "draft" | "sent" | "approved" | "rejected";

export interface ProposalItemInput {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface ProposalListItem {
  id: string;
  title: string;
  status: ProposalStatus;
  total_amount: number;
  valid_until: string | null;
  created_at: string;
  client: {
    id: string;
    name: string;
    company: string;
    slug: string;
  } | null;
}

export interface ProposalDetail {
  id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  total_amount: number;
  public_token: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  client: { id: string; name: string; company: string; slug: string; email: string } | null;
  items: { id: string; name: string; description: string | null; quantity: number; unit_price: number }[];
}

const LIST_SELECT =
  "id, title, status, total_amount, valid_until, created_at, client:clients(id, name, company, slug)";

const DETAIL_SELECT =
  "id, title, description, status, valid_until, total_amount, public_token, sent_at, approved_at, rejected_at, created_at, client:clients(id, name, company, slug, email)";

export async function listProposals(filters?: {
  status?: ProposalStatus | "all";
  search?: string;
}): Promise<ProposalListItem[]> {
  const supabase = await createSiteSupabaseServerClient();

  let query = supabase
    .from("proposals")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as unknown as ProposalListItem[];

  if (filters?.search) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.client?.name.toLowerCase().includes(q) ||
        p.client?.company.toLowerCase().includes(q)
    );
  }

  return rows;
}

export async function getProposalById(id: string): Promise<ProposalDetail | null> {
  const supabase = await createSiteSupabaseServerClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!proposal) return null;

  const { data: items, error: itemsError } = await supabase
    .from("proposal_items")
    .select("id, name, description, quantity, unit_price")
    .eq("proposal_id", id)
    .order("position", { ascending: true });

  if (itemsError) throw itemsError;

  return { ...(proposal as unknown as Omit<ProposalDetail, "items">), items: items ?? [] };
}

export async function createProposal(input: {
  client_id: string;
  title: string;
  description?: string;
  valid_until?: string;
  items: ProposalItemInput[];
  created_by?: string;
}): Promise<string> {
  const supabase = await createSiteSupabaseServerClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      client_id: input.client_id,
      title: input.title,
      description: input.description || null,
      valid_until: input.valid_until || null,
      created_by: input.created_by || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) throw error;

  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from("proposal_items").insert(
      input.items.map((item, i) => ({
        proposal_id: proposal.id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        position: i,
      }))
    );
    if (itemsError) throw itemsError;
  }

  return proposal.id;
}

export async function updateProposal(
  id: string,
  input: {
    client_id: string;
    title: string;
    description?: string;
    valid_until?: string;
    items: ProposalItemInput[];
  }
): Promise<void> {
  const supabase = await createSiteSupabaseServerClient();

  const { error } = await supabase
    .from("proposals")
    .update({
      client_id: input.client_id,
      title: input.title,
      description: input.description || null,
      valid_until: input.valid_until || null,
    })
    .eq("id", id);

  if (error) throw error;

  // Items are few enough (a handful per proposal) that replacing them wholesale
  // is simpler and safer than diffing add/remove/reorder across the client boundary.
  const { error: deleteError } = await supabase
    .from("proposal_items")
    .delete()
    .eq("proposal_id", id);
  if (deleteError) throw deleteError;

  if (input.items.length > 0) {
    const { error: insertError } = await supabase.from("proposal_items").insert(
      input.items.map((item, i) => ({
        proposal_id: id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        position: i,
      }))
    );
    if (insertError) throw insertError;
  }
}

export async function deleteProposal(id: string): Promise<void> {
  const supabase = await createSiteSupabaseServerClient();
  // Only drafts are deletable — enforced here too, not just in the UI.
  const { error } = await supabase.from("proposals").delete().eq("id", id).eq("status", "draft");
  if (error) throw error;
}

export async function sendProposal(id: string): Promise<string> {
  const supabase = await createSiteSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposals")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft") // only a draft can be sent
    .select("public_token")
    .single();
  if (error) throw error;
  return data.public_token;
}
