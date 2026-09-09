import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyCard } from "@/components/ui/Card";

export const metadata = { title: "Stats & Reports" };

export default function StatsPage() {
  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-16">
        <header className="flex flex-col gap-4">
          <Eyebrow>Admin</Eyebrow>
          <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">Stats &amp; Reports</h1>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Traffic, engagement, conversion, and operational reports.
          </p>
        </header>

        <EmptyCard
          label="Coming soon"
          note="Analytics dashboards and exportable reports will live here — PostHog, payments, and demo-request trends."
        />
      </Container>
    </section>
  );
}