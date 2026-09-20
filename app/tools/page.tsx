import type { Metadata } from "next";
import { Calculator, FileDown, FileText, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { EmptyCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/tools", {
    title: "Free Micro-Tools",
    description:
      "Small, free utilities built and maintained by MotionGrid Technologies.",
  });
}

const tools: { name: string; description: string; status: "active" | "soon"; icon: LucideIcon }[] = [
  {
    name: "Quote Estimator",
    description: "A quick job-cost estimator for field service work.",
    status: "soon",
    icon: Calculator,
  },
  {
    name: "Invoice Number Generator",
    description: "Generates clean, sequential invoice references.",
    status: "soon",
    icon: FileText,
  },
  {
    name: "PDF Compressor",
    description: "Shrinks PDF file size without losing quality.",
    status: "soon",
    icon: FileDown,
  },
];

/** Renders the collection of available and upcoming tools. */
export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free micro-tools"
        title="Small tools, genuinely useful on their own."
        lede="A growing set of free utilities — no sign-up, no catch. Each one is a
        small, honest demonstration of what we build."
      />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ icon: Icon, ...tool }) => (
            <div
              key={tool.name}
              className="flex flex-col gap-5 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-lg text-chrome-100">{tool.name}</h3>
                <StatusBadge status={tool.status} />
              </div>
              <p className="text-sm leading-relaxed text-chrome-500">{tool.description}</p>
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[var(--radius-mg)] border border-dashed border-hairline bg-obsidian/40 px-6 py-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-graphite/60">
                  <Icon size={22} className="text-chrome-500" strokeWidth={1.5} />
                </span>
                <p className="mg-eyebrow text-chrome-700">In development</p>
              </div>
            </div>
          ))}

          <EmptyCard
            label="Next tool slot"
            note="Reserved for the next micro-tool we ship."
          />
        </Container>
      </section>
    </>
  );
}
