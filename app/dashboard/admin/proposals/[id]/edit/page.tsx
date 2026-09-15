import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { listClients } from "@/lib/clients-store";
import { getProposalById } from "@/lib/proposals-store";
import { updateProposalAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Proposal",
  robots: { index: false, follow: false },
};

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, clients] = await Promise.all([getProposalById(id), listClients()]);

  if (!proposal) notFound();

  if (proposal.status !== "draft") {
    return (
      <section className="py-12">
        <Container className="flex max-w-3xl flex-col gap-6">
          <Link
            href={`/dashboard/admin/proposals/${id}`}
            className="flex w-fit items-center gap-2 text-sm text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <ArrowLeft size={16} /> Back to proposal
          </Link>
          <div className="flex flex-col items-start gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-8">
            <Eyebrow>Locked</Eyebrow>
            <h1 className="font-display text-2xl text-chrome-100">
              Only drafts can be edited
            </h1>
            <p className="max-w-md text-sm text-chrome-500">
              This proposal has been sent to the client — editing it now would change the terms
              they saw. Duplicate it into a new draft if the scope has changed.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12">
      <Container className="flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <Link
            href={`/dashboard/admin/proposals/${id}`}
            className="flex w-fit items-center gap-2 text-sm text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <ArrowLeft size={16} /> Back to proposal
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>Sales</Eyebrow>
            <StatusBadge status={proposal.status} />
          </div>
          <h1 className="font-display text-3xl text-chrome-100">Edit proposal</h1>
        </header>

        <ProposalForm
          clients={clients}
          action={updateProposalAction.bind(null, id)}
          initial={{
            client_id: proposal.client?.id ?? "",
            title: proposal.title,
            description: proposal.description ?? "",
            valid_until: proposal.valid_until ?? "",
            items: proposal.items.map((item) => ({
              name: item.name,
              description: item.description ?? "",
              quantity: item.quantity,
              unit_price: item.unit_price,
            })),
          }}
          submitLabel="Save Changes"
        />
      </Container>
    </section>
  );
}
