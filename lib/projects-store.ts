import { createSiteSupabaseServiceClient } from "@/lib/site-supabase-service";
import { createSiteSupabaseServerClient } from "@/lib/siteSupabaseServer";

// ---------------------------------------------------------------------------
// MotionGrid projects store.
//
// Admin reads/updates go through the cookie-based server client (RLS
// admin-only policies apply). Project creation happens automatically when a
// client approves a proposal on the public /proposal/[token] page — that runs
// without a session, so it uses the service-role client.
// ---------------------------------------------------------------------------

export type ProjectStatus = "planning" | "active" | "completed" | "cancelled";

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
  } | null;
}

export async function listProjects(filters?: {
  status?: ProjectStatus | "all";
}): Promise<ProjectListItem[]> {
  const supabase = await createSiteSupabaseServerClient();

  let query = supabase
    .from("projects")
    .select(
      "id, name, description, status, proposal_id, created_at, updated_at, client:clients(id, name, company, email)"
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as unknown as ProjectListItem[];
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<void> {
  const supabase = await createSiteSupabaseServerClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", id);
  if (error) throw error;
}

// Called when a client approves a proposal on the public token page. The
// proposals.project_id unique constraint (via ignoreDuplicates) makes this
// idempotent — approving twice, or two admins reacting to the same approval,
// still yields a single project record.
export async function createProjectFromApprovedProposal(input: {
  proposal_id: string;
  client_id: string;
  name: string;
  description?: string | null;
}): Promise<void> {
  const supabase = createSiteSupabaseServiceClient();

  const { error } = await supabase
    .from("projects")
    .upsert(
      {
        proposal_id: input.proposal_id,
        client_id: input.client_id,
        name: input.name,
        description: input.description ?? null,
        status: "planning",
      },
      { onConflict: "proposal_id", ignoreDuplicates: true }
    );

  if (error) throw error;
}
