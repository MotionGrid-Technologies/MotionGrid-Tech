import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/Button";
import { faqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions businesses ask us most — about how we work, timelines, integration, and pricing.",
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

/** Renders the FAQ page together with its structured data. */
export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageSchema} />
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered straight."
        lede="The things businesses ask us most before they pick up the phone. If yours isn't here, just ask — a founder replies directly."
      />

      <section className="py-24 md:py-28">
        <Container className="mx-auto max-w-3xl">
          <FaqAccordion />
        </Container>
      </section>

      <section className="border-t border-hairline">
        <Container className="flex flex-col items-start gap-6 py-20 md:flex-row md:items-center md:justify-between md:py-24">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl leading-tight text-chrome-100">
              Still wondering about something?
            </h2>
            <p className="mt-3 text-chrome-500">
              Skip the search — talk to one of the founders directly and get an
              honest answer about whether we&apos;re the right fit.
            </p>
          </div>
          <Button href="/contact#demo" variant="primary">
            Ask us directly
          </Button>
        </Container>
      </section>
    </>
  );
}
