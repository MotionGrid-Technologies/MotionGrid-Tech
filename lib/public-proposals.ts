import { createSiteSupabaseServiceClient } from "@/lib/site-supabase-service";

// ---------------------------------------------------------------------------
// Public, token-gated proposal reads for /proposal/[token].
//
// There is no user session here — the unguessable public_token in the URL is
// the access control. Every query filters by that exact token, and the
// respond update is constrained to the one valid transition (sent →
// approved/rejected) inside the query itself.
// ---------------------------------------------------------------------------

export interface PublicProposal {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: "draft" | "sent" | "approved" | "rejected";
  valid_until: string | null;
  total_amount: number;
  approved_at: string | null;
  rejected_at: string | null;
  client: { name: string; company: string } | null;
  items: { id: string; name: string; quantity: number; unit_price: number }[];
}

export async function getProposalByPublicToken(token: string): Promise<PublicProposal | null> {
  const supabase = createSiteSupabaseServiceClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(
      "id, client_id, title, description, status, valid_until, total_amount, approved_at, rejected_at, client:clients(name, company)"
    )
    .eq("public_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!proposal) return null;

  const { data: items, error: itemsError } = await supabase
    .from("proposal_items")
    .select("id, name, quantity, unit_price")
    .eq("proposal_id", proposal.id)
    .order("position", { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...(proposal as unknown as Omit<PublicProposal, "items">),
    items: items ?? [],
  };
}

export async function respondToProposal(token: string, response: "approved" | "rejected") {
  const supabase = createSiteSupabaseServiceClient();
  const now = new Date().toISOString();

  const updates =
    response === "approved"
      ? { status: "approved", approved_at: now }
      : { status: "rejected", rejected_at: now };

  const { data, error } = await supabase
    .from("proposals")
    .update(updates)
    .eq("public_token", token)
    .eq("status", "sent") // can only respond to a proposal that's currently awaiting response
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("This proposal is no longer awaiting a response.");
}
