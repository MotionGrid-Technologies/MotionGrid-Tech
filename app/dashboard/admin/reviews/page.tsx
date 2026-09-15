import Link from "next/link";
import { Check, RotateCcw, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StarRating } from "@/components/reviews/StarRating";
import { cn } from "@/lib/cn";
import { listReviews, type Review, type ReviewStatus } from "@/lib/reviews-store";
import { setReviewStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

const STATUS_TABS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  email: "Email",
  google: "Google",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const activeStatus = STATUS_TABS.some((t) => t.key === status)
    ? (status as ReviewStatus | "all")
    : "pending";

  const [reviews, allReviews] = await Promise.all([
    listReviews({ status: activeStatus }),
    listReviews(),
  ]);

  const counts = {
    all: allReviews.length,
    pending: allReviews.filter((r) => r.status === "pending").length,
    approved: allReviews.filter((r) => r.status === "approved").length,
    rejected: allReviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <section className="py-12">
      <Container className="flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <Eyebrow>Social proof</Eyebrow>
          <h1 className="font-display text-3xl text-chrome-100">Reviews</h1>
          <p className="text-sm text-chrome-500">
            Approve or reject submitted reviews before they appear on{" "}
            <Link href="/testimonials" className="text-chrome-300 hover:text-signal">
              /testimonials
            </Link>
            .
          </p>
        </header>

        {/* Status filter ------------------------------------------------------ */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/admin/reviews?status=${tab.key}`}
              className={cn(
                "rounded-[var(--radius-mg)] border px-4 py-2 text-sm capitalize transition-colors",
                activeStatus === tab.key
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-hairline text-chrome-500 hover:text-chrome-100"
              )}
            >
              {tab.label} ({counts[tab.key]})
            </Link>
          ))}
        </div>

        {/* Moderation queue ------------------------------------------------------ */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[var(--radius-mg-lg)] border border-dashed border-hairline p-12 text-center">
            <span className="mg-eyebrow text-chrome-700">Queue clear</span>
            <p className="max-w-sm text-sm text-chrome-700">
              No reviews in this filter right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const created = new Date(review.createdAt).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-chrome-100">{review.author}</span>
          {review.company && <span className="text-xs text-chrome-700">{review.company}</span>}
          <StatusBadge status={review.status === "pending" ? "pending" : review.status} />
          <span className="text-xs text-chrome-700">via {SOURCE_LABELS[review.source] ?? review.source}</span>
          <span className="text-xs text-chrome-700">{created}</span>
        </div>
        <StarRating rating={review.rating} />
        <p className="max-w-2xl text-sm leading-relaxed text-chrome-300">
          &ldquo;{review.quote}&rdquo;
        </p>
      </div>

      <form className="flex shrink-0 flex-wrap gap-2">
        {review.status !== "approved" && (
          <button
            formAction={setReviewStatusAction.bind(null, review.id, "approved")}
            className="flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-green-800 bg-green-900/20 px-3 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-900/40"
          >
            <Check size={14} /> Approve
          </button>
        )}
        {review.status !== "rejected" && (
          <button
            formAction={setReviewStatusAction.bind(null, review.id, "rejected")}
            className="flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-red-800 bg-red-900/20 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/40"
          >
            <X size={14} /> Reject
          </button>
        )}
        {review.status !== "pending" && (
          <button
            formAction={setReviewStatusAction.bind(null, review.id, "pending")}
            className="flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-3 py-2 text-xs font-medium text-chrome-500 transition-colors hover:text-chrome-100"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </form>
    </article>
  );
}
