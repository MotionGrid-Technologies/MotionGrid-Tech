import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { listApprovedReviews, type Review } from "@/lib/reviews-store";
import { buildPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/testimonials", {
    title: "Testimonials",
    description: "What clients and partners say about working with MotionGrid Technologies.",
  });
}

/** Renders all approved client testimonials. */
export default async function TestimonialsPage() {
  const reviews = await listApprovedReviews();

  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Don't take our word for it."
        lede="Quotes from the people who run their operations on software we've built."
      />

      <section className="py-24 md:py-28">
        <Container>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 py-24 text-center">
              <p className="font-display text-2xl text-chrome-300">No testimonials published yet</p>
              <p className="text-sm text-chrome-700">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <TestimonialCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/** Renders one approved testimonial with its rating and attribution. */
function TestimonialCard({ review: r }: { review: Review }) {
  return (
    <figure className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-6">
      <div className="flex items-center gap-1 text-signal" aria-label={`${r.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={i < r.rating ? "text-signal" : "text-hairline"}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-chrome-300">
        “{r.quote}”
      </blockquote>
      <figcaption className="flex flex-col gap-0.5">
        <span className="font-display text-sm text-chrome-100">{r.name}</span>
        {(r.role || r.company) && (
          <span className="mg-eyebrow">
            {[r.role, r.company].filter(Boolean).join(" · ")}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
