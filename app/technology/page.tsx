import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechBadge } from "@/components/ui/TechBadge";
import { Button } from "@/components/ui/Button";
import { technologies } from "@/lib/technologies";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "The stack MotionGrid Technologies specialises in: Next.js, React, TypeScript, C#, Python, and Supabase.",
};

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title="A small stack, known deeply."
        lede="We'd rather be excellent in six technologies than average in twenty.
        Every one below is chosen for reliability at production scale."
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Core stack" title="What we build with." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((t) => (
              <TechBadge
                key={t.name}
                logo={t.logo}
                name={t.name}
                category={t.category}
                description={t.description}
              />
            ))}
          </div>
          <div>
            <Button
              href="/technology/other-technologies"
              variant="ghost"
              className="self-start"
            >
              Other Technologies <ArrowUpRight size={16} />
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <SectionHeading
            eyebrow="Approach"
            title="Boring technology, on purpose."
            lede="Frontier tools are used where they earn their place — not for their
            own sake."
          />
          <div className="flex flex-col gap-6 text-chrome-500">
            <p className="leading-relaxed">
              Next.js and React carry the interface layer: fast, typed, and
              maintainable. TypeScript is non-negotiable across the frontend —
              it&apos;s how a two-person team keeps a growing codebase honest.
            </p>
            <p className="leading-relaxed">
              On the backend, we reach for C#, Python, or Supabase depending on
              the problem: C# for robust services, Python where data and AI
              work leads, Supabase where a managed Postgres backend earns its
              place.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
