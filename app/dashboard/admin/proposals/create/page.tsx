import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { listClients } from "@/lib/clients-store";
import { createProposalAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Proposal",
  robots: { index: false, follow: false },
};

export default async function CreateProposalPage() {
  const clients = await listClients();

  return (
    <section className="py-12">
      <Container className="flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <Link
            href="/dashboard/admin/proposals"
            className="flex w-fit items-center gap-2 text-sm text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <ArrowLeft size={16} /> All proposals
          </Link>
          <Eyebrow>Sales</Eyebrow>
          <h1 className="font-display text-3xl text-chrome-100">New proposal</h1>
          <p className="text-sm text-chrome-500">
            Draft the quote here — nothing is visible to the client until you send it.
          </p>
        </header>

        <ProposalForm
          clients={clients}
          action={createProposalAction}
          submitLabel="Create Proposal"
        />
      </Container>
    </section>
  );
}
