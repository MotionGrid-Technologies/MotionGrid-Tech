import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { getProposalByPublicToken } from "@/lib/public-proposals";
import { site } from "@/lib/site";
import { RespondButtons } from "./RespondButtons";

// Token-gated client view — the unguessable public_token in the URL is the
// access control. Never indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Proposal",
  robots: { index: false, follow: false },
};

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await getProposalByPublicToken(token).catch(() => null);

  if (!proposal) notFound();

  return (
    <section className="mg-brushed min-h-screen py-16 md:py-24">
      <Container className="flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Eyebrow>Proposal · {site.shortName}</Eyebrow>
          <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">{proposal.title}</h1>
          <p className="text-sm text-chrome-500">
            Prepared for {proposal.client?.company ?? "your team"}
            {proposal.client?.name ? ` — ${proposal.client.name}` : ""}
          </p>
        </header>

        {proposal.status === "draft" ? (
          <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-8">
            <p className="text-sm text-chrome-500">
              This proposal isn&apos;t available yet. If you believe you should have access,
              contact us at{" "}
              <a href={`mailto:${site.email}`} className="text-signal hover:text-signal-high">
                {site.email}
              </a>
              .
            </p>
          </div>
        ) : (
          <>
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

            {proposal.valid_until && (
              <p className="text-xs text-chrome-700">
                Pricing valid until{" "}
                {new Date(proposal.valid_until).toLocaleDateString("en-ZA", {
                  dateStyle: "long",
                })}
                .
              </p>
            )}

            {proposal.status === "sent" && <RespondButtons token={token} />}

            {proposal.status === "approved" && (
              <div className="flex items-start gap-3 rounded-[var(--radius-mg-lg)] border border-signal/30 bg-signal/5 p-6">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-signal" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-chrome-100">Approved</p>
                  <p className="text-sm text-chrome-500">
                    Approved on{" "}
                    {proposal.approved_at
                      ? new Date(proposal.approved_at).toLocaleString("en-ZA", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })
                      : "—"}
                    . Your project is being set up — a founder will be in touch.
                  </p>
                </div>
              </div>
            )}

            {proposal.status === "rejected" && (
              <div className="flex items-start gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6">
                <XCircle size={18} className="mt-0.5 shrink-0 text-chrome-500" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-chrome-100">Declined</p>
                  <p className="text-sm text-chrome-500">
                    This proposal was declined. If the scope or terms need adjusting, reply to
                    the email that sent you this link.
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-hairline pt-6">
              <p className="text-xs text-chrome-700">
                Questions before deciding? Email{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="text-chrome-500 hover:text-signal"
                >
                  {site.email}
                </a>{" "}
                or{" "}
                <Button href="/contact#booking" variant="ghost" size="sm" className="px-0">
                  book a 15-minute call
                </Button>
                .
              </p>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
