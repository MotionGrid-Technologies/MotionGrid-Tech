import type { Review } from "@/lib/reviews-store";
import { Card } from "@/components/ui/Card";
import { StarRating } from "./StarRating";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <StarRating rating={review.rating} />
        <span className="mg-eyebrow capitalize text-chrome-700">{review.source}</span>
      </div>

      <blockquote className="text-sm leading-relaxed text-chrome-300">
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-hairline pt-4">
        <span className="text-sm font-medium text-chrome-100">{review.author}</span>
        {(review.role || review.company) && (
          <span className="text-xs text-chrome-500">
            {[review.role, review.company].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
    </Card>
  );
}
