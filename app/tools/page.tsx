import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { EmptyCard } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export const metadata: Metadata = {
  title: "Free Micro-Tools",
  description:
    "Small, free utilities built and maintained by MotionGrid Technologies.",
};

// TODO: replace with real micro-tools as they're built. Each one should be
// small, genuinely useful on its own, and a quiet demonstration of capability.
const tools: { name: string; description: string; status: "active" | "soon" }[] = [
  {
    name: "Quote Estimator",
    description: "A quick job-cost estimator for field service work.",
    status: "soon",
  },
  {
    name: "Invoice Number Generator",
    description: "Generates clean, sequential invoice references.",
    status: "soon",
  },
  {
    name: "PDF Compressor",
    description: "Shrinks PDF file size without losing quality.",
    status: "soon",
  },
];

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
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-chrome-100">{tool.name}</h3>
                <StatusPill status={tool.status} />
              </div>
              <p className="text-sm leading-relaxed text-chrome-500">{tool.description}</p>
              {/* TODO: this is the mount point for the actual tool UI/logic */}
              <div className="mt-2 h-24 rounded-[var(--radius-mg)] border border-dashed border-hairline" />
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
