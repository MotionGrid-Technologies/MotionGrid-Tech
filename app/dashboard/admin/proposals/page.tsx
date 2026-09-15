import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { listProposals, type ProposalStatus } from "@/lib/proposals-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Proposals",
  robots: { index: false, follow: false },
};

const STATUS_TABS: { key: ProposalStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "sent", label: "Sent" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

export default async function ProposalsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const activeStatus = STATUS_TABS.some((t) => t.key === status)
    ? (status as ProposalStatus | "all")
    : "all";
  const search = (q ?? "").trim();

  const proposals = await listProposals({ status: activeStatus, search });

  const tabHref = (key: string) =>
    `/dashboard/admin/proposals?status=${key}${search ? `&q=${encodeURIComponent(search)}` : ""}`;

  return (
    <section className="py-12">
      <Container className="flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Eyebrow>Sales</Eyebrow>
            <h1 className="font-display text-3xl text-chrome-100">Proposals</h1>
            <p className="text-sm text-chrome-500">
              Build quotes, send token-protected client links, and track approvals.
            </p>
          </div>
          <Button href="/dashboard/admin/proposals/create" variant="primary">
            <Plus size={16} />
            New Proposal
          </Button>
        </header>

        {/* Filters ---------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tabHref(tab.key)}
                className={cn(
                  "rounded-[var(--radius-mg)] border px-4 py-2 text-sm transition-colors",
                  activeStatus === tab.key
                    ? "border-signal bg-signal/10 text-signal"
                    : "border-hairline text-chrome-500 hover:text-chrome-100"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form className="flex gap-2" action="/dashboard/admin/proposals">
            <input type="hidden" name="status" value={activeStatus} />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search title or client…"
              aria-label="Search proposals"
              className="mg-input w-56"
            />
            <Button type="submit" variant="chrome" size="sm">
              Search
            </Button>
          </form>
        </div>

        {/* List -------------------------------------------------------------- */}
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-mg-lg)] border border-dashed border-hairline p-12 text-center">
            <span className="mg-eyebrow text-chrome-700">Nothing here</span>
            <p className="max-w-sm text-sm text-chrome-700">
              {search || activeStatus !== "all"
                ? "No proposals match this filter."
                : "Create your first proposal — it takes a client, a title, and a few line items."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline">
            <table className="w-full text-left text-sm">
              <thead className="bg-graphite/60 text-xs uppercase tracking-wide text-chrome-700">
                <tr>
                  <th className="px-4 py-3">Proposal</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Valid until</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {proposals.map((p) => (
                  <tr key={p.id} className="text-chrome-500 transition-colors hover:bg-graphite/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/admin/proposals/${p.id}`}
                        className="text-chrome-100 hover:text-signal"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {p.client ? (
                        <span className="text-chrome-300">{p.client.company}</span>
                      ) : (
                        <span className="text-chrome-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-chrome-100">
                      {formatZAR(p.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-chrome-500">
                      {p.valid_until
                        ? new Date(p.valid_until).toLocaleDateString("en-ZA")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-chrome-700">
                      {new Date(p.created_at).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/dashboard/admin/proposals/${p.id}`}
                        aria-label={`Open ${p.title}`}
                        className="text-chrome-700 hover:text-chrome-100"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}
