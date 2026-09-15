import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Testimonials } from "@/components/sections/Testimonials";
import { ClientLogosMarquee } from "@/components/sections/ClientLogosMarquee";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRating } from "@/components/reviews/StarRating";
import { testimonials } from "@/lib/testimonials";
import { clientLogos } from "@/lib/client-logos";
import { averageRating, listApprovedReviews } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What clients say about working with MotionGrid Technologies — testimonials and reviews from plumbing, fleet maintenance, panel beating, and retail partners.",
};

export default async function TestimonialsPage() {
  const approvedReviews = await listApprovedReviews();
  const avg = averageRating(approvedReviews);

  return (
    <>
      <PageHero
        eyebrow="Social proof"
        title="What it's like to work with us."
        lede="Straight from the operators, managers, and founders who use what we've built every day."
      />

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Testimonials" title="In their words." />
          <Testimonials items={testimonials} />
        </Container>
      </section>

      <ClientLogosMarquee logos={clientLogos} />

      <section className="border-t border-hairline bg-graphite/30 py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Reviews" title="Client reviews." />
            {approvedReviews.length > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={Math.round(avg)} size={18} />
                <span className="text-sm text-chrome-500">
                  {avg.toFixed(1)} / 5 across {approvedReviews.length} reviews
                </span>
              </div>
            )}
          </div>

          {approvedReviews.length === 0 ? (
            <p className="text-sm text-chrome-500">No published reviews yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
