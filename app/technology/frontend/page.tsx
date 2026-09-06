import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TechBadge } from "@/components/ui/TechBadge";
import { FrontendFrameworks } from "@/lib/technologies";

export const metadata: Metadata = {
  title: "Frontend Technology",
  description: "The frontend frameworks and languages MotionGrid Technologies uses.",
};

export default function FrontendTechnologyPage() {
  const crumbs = [
    { label: "Technology", href: "/technology" },
    { label: "Other technologies", href: "/technology/other-technologies" },
    { label: "Frontend" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Technology / Other technologies / Frontend"
        title="What shapes the interface."
        lede="The frameworks and languages we use to build fast, accessible, and maintainable user experiences."
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <Breadcrumb crumbs={crumbs} />
          <SectionHeading eyebrow="Frontend stack" title="What we build with." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FrontendFrameworks.map((t) => (
              <TechBadge
                key={t.name}
                logo={t.logo}
                name={t.name}
                category={t.category}
                description={t.description}
              />
            ))}
          </div>

          <nav className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8 text-sm">
            <Link
              href="/technology/other-technologies"
              className="group inline-flex items-center gap-2 text-chrome-300 transition-colors hover:text-chrome-100"
            >
              <ArrowLeft size={16} className="text-chrome-500 transition-transform group-hover:-translate-x-1" />
              Back to other technologies
            </Link>
            <Link
              href="/technology/backend"
              className="group inline-flex items-center gap-2 text-chrome-300 transition-colors hover:text-chrome-100"
            >
              Switch to backend
              <ArrowRight size={16} className="text-chrome-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </nav>
        </Container>
      </section>
    </>
  );
}