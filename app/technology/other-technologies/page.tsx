import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TechCategoryCard } from "@/components/ui/techCategoryCard";
import { FrontendFrameworks, BackendFrameworks } from "@/lib/technologies";

export const metadata: Metadata = {
  title: "Other Technologies",
  description:
    "Browse the wider frontend and backend technologies MotionGrid Technologies reaches for beyond the core stack.",
};

export default function OtherTechnologiesPage() {
  const crumbs = [
    { label: "Technology", href: "/technology" },
    { label: "Other technologies" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Technology / Other technologies"
        title="Dig into a category."
        lede="Beyond the core stack, here are the other frameworks, runtimes, and databases we reach for — grouped by where they live in the stack."
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <Breadcrumb crumbs={crumbs} />
          <SectionHeading
            eyebrow="Explore"
            title="Pick a layer of the stack."
            lede="Select a category to see the wider set of technologies we use there."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TechCategoryCard
              href="/technology/frontend"
              title="Frontend"
              description="The frameworks and languages that shape what people see and touch."
              count={FrontendFrameworks.length}
            />
            <TechCategoryCard
              href="/technology/backend"
              title="Backend"
              description="The frameworks, runtimes, and databases powering what happens behind the scenes."
              count={BackendFrameworks.length}
            />
          </div>
        </Container>
      </section>
    </>
  );
}