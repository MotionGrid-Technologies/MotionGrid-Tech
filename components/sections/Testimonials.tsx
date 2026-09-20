import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listApprovedReviews, type Review } from "@/lib/reviews-store";

// Public testimonials strip for the homepage. Renders nothing until an admin
// approves a review, so the empty state never ships placeholder copy.
export async function Testimonials() {
  const reviews = await listApprovedReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-hairline bg-graphite/30 py-24 md:py-32">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Testimonials"
            title="What teams say after working with us."
            lede="Straight from the people who run the day-to-day on top of what we build."
          />
          <Link
            href="/testimonials"
            className="flex items-center gap-1 text-sm text-chrome-300 hover:text-chrome-100"
          >
            All testimonials <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <TestimonialCard key={r.id} review={r} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function TestimonialCard({ review: r }: { review: Review }) {
  return (
    <figure className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-obsidian/60 p-6">
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