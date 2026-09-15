import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real projects, real results — how MotionGrid Technologies has helped plumbing, fleet maintenance, and panel-beating businesses replace manual processes with software.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Results, not just claims."
        lede="A look at the problems we've been brought in to solve, and what changed afterward."
      />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {caseStudies.map((cs) => (
            <Link key={cs.slug} href={`/case-studies/${cs.slug}`} className="block">
              <Card className="flex h-full flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="mg-eyebrow text-signal">{cs.industry}</span>
                  <ArrowUpRight
                    size={18}
                    className="text-chrome-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-chrome-100"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-2xl text-chrome-100">{cs.title}</h2>
                  <p className="text-sm text-chrome-500">{cs.client}</p>
                </div>
                <p className="text-sm leading-relaxed text-chrome-500">{cs.summary}</p>
                <div className="mt-auto grid grid-cols-3 gap-4 border-t border-hairline pt-6">
                  {cs.results.slice(0, 3).map((r) => (
                    <div key={r.label} className="flex flex-col gap-1">
                      <span className="font-display text-xl text-signal">{r.value}</span>
                      <span className="text-xs leading-tight text-chrome-700">{r.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </Container>
      </section>
    </>
  );
}
