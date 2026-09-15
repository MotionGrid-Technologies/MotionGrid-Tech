import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProposalById } from "@/lib/proposals-store";
import { deleteDraftProposalAction } from "../actions";
import { SendProposalButton } from "@/components/proposals/SendProposalButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Proposal",
  robots: { index: false, follow: false },
};

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) notFound();

  return (
    <section className="py-12">
      <Container className="flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Link
            href="/dashboard/admin/proposals"
            className="flex w-fit items-center gap-2 text-sm text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <ArrowLeft size={16} /> All proposals
          </Link>
          <Eyebrow>Sales</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-3xl text-chrome-100 md:text-4xl">{proposal.title}</h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-sm text-chrome-500">{proposal.client?.company}</p>
        </header>

        {proposal.description && (
          <p className="text-sm leading-relaxed text-chrome-500">{proposal.description}</p>
        )}

        <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-graphite/60 text-xs uppercase tracking-wide text-chrome-700">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {proposal.items.map((item) => (
                <tr key={item.id} className="text-chrome-500">
                  <td className="px-4 py-3 text-chrome-100">{item.name}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatZAR(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right text-chrome-100">
                    {formatZAR(item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-chrome-500">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-display text-lg text-chrome-100">
                  {formatZAR(proposal.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-chrome-700">
          <span>Created {new Date(proposal.created_at).toLocaleDateString("en-ZA")}</span>
          {proposal.valid_until && (
            <span>Valid until {new Date(proposal.valid_until).toLocaleDateString("en-ZA")}</span>
          )}
          {proposal.sent_at && <span>Sent {new Date(proposal.sent_at).toLocaleString("en-ZA")}</span>}
          {proposal.approved_at && (
            <span>Approved {new Date(proposal.approved_at).toLocaleString("en-ZA")}</span>
          )}
          {proposal.rejected_at && (
            <span>Rejected {new Date(proposal.rejected_at).toLocaleString("en-ZA")}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
          <div className="flex flex-wrap gap-3">
            {proposal.status === "draft" && (
              <>
                <Button href={`/dashboard/admin/proposals/${id}/edit`} variant="chrome">
                  Edit Proposal
                </Button>
                <form>
                  <Button
                    formAction={deleteDraftProposalAction.bind(null, id)}
                    variant="ghost"
                    className="text-signal hover:text-signal-high"
                  >
                    Delete Draft
                  </Button>
                </form>
              </>
            )}
          </div>

          {proposal.status === "draft" && <SendProposalButton id={id} />}

          {proposal.status !== "draft" && (
            <Link
              href={`/proposal/${proposal.public_token}`}
              target="_blank"
              className="flex items-center gap-1 text-sm text-chrome-300 hover:text-chrome-100"
            >
              View client link →
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
