import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyCard } from "@/components/ui/Card";
import { LeadsChart, RevenueChart } from "@/components/admin/AnalyticsCharts";
import { getAnalyticsSnapshot } from "@/lib/analytics-store";

// Admin analytics dashboard (TODO Phase 8): revenue, leads, MRR and churn in
// one view. Revenue reads the PayFast feed; MRR/churn read the subscriptions
// table (populated once the billing engine lands).

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics", robots: { index: false, follow: false } };

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot();
  const { series, totals } = snapshot;
  const hasAnyData = totals.leads > 0 || totals.bookings > 0 || totals.revenueGross > 0;

  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-16">
        {/* Header ---------------------------------------------------------- */}
        <header className="flex flex-col gap-4">
          <Eyebrow>Admin</Eyebrow>
          <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">Analytics</h1>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Revenue, lead flow, and recurring revenue health. Figures are live
            reads of the MotionGrid Supabase project — nothing is cached at
            build time.
          </p>
        </header>

        {!hasAnyData ? (
          <EmptyCard
            label="No data yet"
            note="Leads, bookings, and payments will chart here as they come in."
          />
        ) : (
          <>
            {/* Headline tiles ------------------------------------------------ */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="MRR" value={formatZAR(totals.mrr)} note={`${totals.activeSubscriptions} active subscriptions`} />
              <Stat
                label="Churn"
                value={totals.churnRate === null ? "—" : `${(totals.churnRate * 100).toFixed(1)}%`}
                note={`${totals.cancelledSubscriptions} cancelled all-time`}
              />
              <Stat
                label="Leads (12 mo)"
                value={String(totals.leads)}
                note={`${totals.hotLeads} hot · avg score ${totals.avgLeadScore ?? "—"}`}
              />
              <Stat
                label="Revenue (net)"
                value={formatZAR(totals.revenueNet)}
                note={`${formatZAR(totals.revenueGross)} gross`}
              />
            </div>

            {/* Charts --------------------------------------------------------- */}
            <ChartCard title="Leads & booked calls" note="Bars: demo requests · Line: slot bookings">
              <LeadsChart data={series} />
            </ChartCard>

            <ChartCard title="Revenue by month" note="Completed PayFast payments">
              <RevenueChart data={series} />
            </ChartCard>

            {/* Secondary tiles ------------------------------------------------ */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Open requests" value={String(totals.newLeads)} note={`${totals.contactedLeads} contacted`} />
              <Stat label="Upcoming calls" value={String(totals.upcomingBookings)} note={`${totals.bookings} booked all-time`} />
              <Stat label="Active clients" value={String(totals.activeClients)} note={`${totals.prospectClients} prospects`} />
              <Stat
                label="Past due"
                value={String(totals.pastDueSubscriptions)}
                note="kill-switch flags these"
              />
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
      <div className="font-display text-3xl text-chrome-100">{value}</div>
      <div className="mg-eyebrow mt-1.5">{label}</div>
      {note && <p className="mt-1 text-xs text-chrome-700">{note}</p>}
    </div>
  );
}

function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-chrome-100">{title}</h2>
        <span className="text-xs text-chrome-700">{note}</span>
      </div>
      {children}
    </div>
  );
}
