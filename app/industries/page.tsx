import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { industries } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Industries MotionGrid Technologies builds for: plumbing, fleet maintenance, panel beating, and applied AI — with more coming soon.",
};

export default function IndustriesPage() {
  const active = industries.filter((i) => i.status === "active");
  const soon = industries.filter((i) => i.status === "soon");

  return (
    <>
      <section id="active-industries" className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Industries" title="Active industries." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {active.map((ind) => (
              <Card key={ind.slug} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-chrome-100">{ind.name}</h3>
                  <StatusPill status={ind.status} />
                </div>
                <p className="text-sm leading-relaxed text-chrome-500">{ind.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline bg-graphite/30 py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Expanding" title="Coming soon." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {soon.map((ind) => (
              <Card key={ind.slug} className="flex flex-col gap-4 opacity-70">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-chrome-100">{ind.name}</h3>
                  <StatusPill status={ind.status} />
                </div>
                <p className="text-sm leading-relaxed text-chrome-500">{ind.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
