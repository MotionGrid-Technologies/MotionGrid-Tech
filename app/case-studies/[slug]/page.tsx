import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { caseStudies, getCaseStudyBySlug } from "@/lib/case-studies";

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return { title: "Case Study" };
  return {
    title: cs.title,
    description: cs.summary,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  return (
    <>
      <section className="mg-brushed border-b border-hairline">
        <Container className="flex flex-col gap-6 py-20 md:py-28">
          <Link
            href="/case-studies"
            className="flex w-fit items-center gap-2 text-sm text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <ArrowLeft size={16} /> All case studies
          </Link>
          <Eyebrow>{cs.industry}</Eyebrow>
          <h1 className="max-w-2xl font-display text-[2.25rem] italic leading-[1.08] tracking-[-0.01em] text-chrome-100 md:text-[3rem]">
            {cs.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-chrome-500">{cs.summary}</p>
          <p className="text-sm text-chrome-700">Client: {cs.client}</p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {cs.results.map((r) => (
            <Card key={r.label} className="flex flex-col gap-2">
              <span className="font-display text-3xl text-signal">{r.value}</span>
              <span className="text-sm text-chrome-500">{r.label}</span>
            </Card>
          ))}
        </Container>
      </section>

      <section className="border-t border-hairline bg-graphite/30 py-20 md:py-24">
        <Container className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-chrome-100">The challenge</h2>
            <p className="leading-relaxed text-chrome-500">{cs.challenge}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-chrome-100">The solution</h2>
            <p className="leading-relaxed text-chrome-500">{cs.solution}</p>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {cs.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-chrome-500"
              >
                {tag}
              </span>
            ))}
          </div>
          <Button href="/contact#demo" variant="primary">
            Discuss a similar project
          </Button>
        </Container>
      </section>
    </>
  );
}
