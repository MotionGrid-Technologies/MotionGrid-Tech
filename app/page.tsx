import { ArrowUpRight, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechBadge } from "@/components/ui/TechBadge";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { technologies } from "@/lib/technologies";
import { industries } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero
        eyebrow="Precision software, engineered in-house"
        title={
          <>
            <span className="mg-chrome-text not-italic">Developing </span>{" "}
            software moves businesses forward.
          </>
        }
        description="MotionGrid Technologies designs custom software platforms that simplify operations and eliminate repetitive work. We build tailor-made platforms that automate workflows, connect teams, and scale with your company"
        cta={{ primary: { label: "Book a free demo", href: "/contact#demo" } }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Proof strip                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-hairline">
        <Container className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              icon: Gauge,
              title: "Built for performance",
              copy: "Fast, resilient systems tuned for real operating conditions, not demo conditions.",
            },
            {
              icon: Wrench,
              title: "Engineered, not templated",
              copy: "Every platform is designed around the actual workflow it needs to carry.",
            },
            {
              icon: ShieldCheck,
              title: "Built for scalability",
              copy: "Typed, tested foundations that stay maintainable and scalable as the product grows.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex flex-col gap-3 py-10 md:px-10 md:py-16">
              <Icon size={20} className="text-signal" strokeWidth={1.5} />
              <h3 className="font-display text-xl text-chrome-100">{title}</h3>
              <p className="text-sm leading-relaxed text-chrome-500">{copy}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Technology                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 md:py-32">
        <Container className="flex flex-col gap-14">
          <SectionHeading
            eyebrow="Stack"
            title="Technology we specialise in."
            lede="Built with technologies we trust, refined through experience, and selected for real-world performance."
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {technologies.map((t) => (
              <TechBadge key={t.name} logo={t.logo} name={t.name} category={t.category} />
            ))}
          </div>
          <Button href="/technology" variant="ghost" className="self-start">
            More on our technology <ArrowUpRight size={16} />
          </Button>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Industries                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-hairline bg-graphite/30 py-24 md:py-32">
        <Container className="flex flex-col gap-14">
          <SectionHeading
            eyebrow="Industries"
            title="Built around real operations."
            lede="From startups to established enterprises, we design software tailored to the way your industry operates"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind) => (
              <Card key={ind.slug} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-chrome-100">{ind.name}</h3>
                  <StatusPill status={ind.status} />
                </div>
                <p className="text-sm leading-relaxed text-chrome-500">{ind.description}</p>
              </Card>
            ))}
          </div>
          <Button href="/industries#active-industries" variant="ghost" className="self-start">
            All industries <ArrowUpRight size={16} />
          </Button>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA banner                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-hairline">
        <Container className="flex flex-col items-start gap-8 py-24 md:flex-row md:items-center md:justify-between md:py-28">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl leading-tight text-chrome-100 md:text-4xl">
              Have an operational problem worth solving properly?
            </h2>
            <p className="mt-4 text-chrome-500">
              Tell us where the friction is. We&apos;ll tell you honestly whether
              software is the right fix.
            </p>
          </div>
          <div className="flex gap-4">
            <Button href="/contact#demo" variant="primary">
              Book a free demo
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
