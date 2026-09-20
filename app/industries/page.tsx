import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { industries } from "@/lib/site";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/industries", {
    title: "Industries",
    description:
      "Industries MotionGrid Technologies builds for: plumbing, fleet maintenance, panel beating, and applied AI — with more coming soon.",
  });
}

/** Renders active and upcoming industry offerings. */
export default function IndustriesPage() {
  const active = industries.filter((i) => i.status === "active");
  const soon = industries.filter((i) => i.status === "soon");

  return (
    <>
      <section id="active-industries" className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <Eyebrow>Industries</Eyebrow>
            <h1 className="font-display text-[2.25rem] leading-[1.08] tracking-[-0.01em] text-chrome-100 md:text-[3rem]">
              Active industries.
            </h1>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {active.map((ind) => (
              <Card key={ind.slug} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-chrome-100">{ind.name}</h2>
                  <StatusBadge status={ind.status} />
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
                  <StatusBadge status={ind.status} />
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
