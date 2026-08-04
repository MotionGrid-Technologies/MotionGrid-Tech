import Link from "next/link";
import { ArrowUpRight, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { TechBadge } from "@/components/ui/TechBadge";
import { Filament } from "@/components/motifs/Filament";
import { technologies } from "@/lib/technologies";
import { industries } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-hairline mg-brushed">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <Filament />
        </div>
        <Container className="relative flex min-h-[86vh] flex-col justify-center gap-8 py-28">
          <Eyebrow>Precision software, engineered in-house</Eyebrow>
          <h1 className="max-w-3xl font-display text-[2.75rem] italic leading-[1.05] tracking-[-0.01em] text-chrome-100 sm:text-[3.5rem] md:text-[4.5rem]">
            <span className="mg-chrome-text not-italic">Developing </span>{" "}
            software moves businesses forward.
            <br className="hidden sm:block" /> 
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-chrome-500">
            MotionGrid Technologies designs  custom software platforms that simplify operations and eliminate repetitive work.
             We build tailor-made platforms that automate workflows, connect teams, and scale with your company
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button href="/contact#demo" variant="primary">
              Book a demo <ArrowUpRight size={16} />
            </Button>
          </div>
        </Container>
      </section>

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
              <TechBadge key={t.name} glyph={t.glyph} name={t.name} category={t.category} />
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
          <Button href="/industries" variant="ghost" className="self-start">
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
              Book a demo <ArrowUpRight size={16} />
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
