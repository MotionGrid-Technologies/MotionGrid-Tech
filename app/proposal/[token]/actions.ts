"use server";

import { revalidatePath } from "next/cache";
import {
  getProposalByPublicToken,
  respondToProposal,
} from "@/lib/public-proposals";
import { createProjectFromApprovedProposal } from "@/lib/projects-store";

export type ProposalResponseState = {
  ok: boolean;
  message: string;
};

// Public, token-gated response. No session — the unguessable public_token in
// the URL is the access control, and respondToProposal constrains the update
// to the single valid transition (sent → approved/rejected) inside the query.
export async function respondToProposalAction(
  token: string,
  response: "approved" | "rejected"
): Promise<ProposalResponseState> {
  try {
    await respondToProposal(token, response);
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong recording your response.",
    };
  }

  if (response === "approved") {
    // Auto-create the delivery project for approved proposals. Idempotent —
    // a second approval attempt can't produce a duplicate project.
    const proposal = await getProposalByPublicToken(token);
    if (proposal) {
      try {
        await createProjectFromApprovedProposal({
          proposal_id: proposal.id,
          client_id: proposal.client_id,
          name: proposal.title,
          description: proposal.description,
        });
      } catch (err) {
        console.error("createProjectFromApprovedProposal failed", err);
      }
    }
  }

  revalidatePath(`/proposal/${token}`);
  revalidatePath("/dashboard/admin/projects");

  return {
    ok: true,
    message:
      response === "approved"
        ? "Approved — your project is being set up. We'll be in touch to kick things off."
        : "Thanks for letting us know. The proposal is marked as declined.",
  };
}
