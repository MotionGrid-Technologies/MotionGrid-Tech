import Link from "next/link";
import { addReview, removeReview, setReviewStatus } from "@/lib/actions/reviews";
import { listReviews, type Review, type ReviewStatus } from "@/lib/reviews-store";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

const FILTERS: ("all" | ReviewStatus)[] = ["all", "pending", "approved", "rejected"];

const STATUS_TONE: Record<ReviewStatus, string> = {
  pending: "text-signal border-signal/40",
  approved: "text-chrome-100 border-chrome-500",
  rejected: "text-chrome-700 border-hairline",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const filter = FILTERS.includes(statusParam as "all" | ReviewStatus)
    ? (statusParam as "all" | ReviewStatus)
    : "all";

  const reviews = await listReviews();
  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl text-chrome-100">Reviews</h1>
            <p className="text-sm text-chrome-500">
              Testimonials for the homepage and /testimonials. Approved reviews are public.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="text-sm text-chrome-300 hover:text-chrome-100"
          >
            View public page →
          </Link>
        </header>

        {/* Add review */}
        <form
          action={addReview}
          className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6"
        >
          <h2 className="font-display text-lg text-chrome-100">Add a review</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mg-eyebrow mb-1.5 block" htmlFor="r-name">
                Name
              </label>
              <input
                id="r-name"
                name="name"
                minLength={2}
                required
                className="mg-input"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mg-eyebrow mb-1.5 block" htmlFor="r-role">
                Role
              </label>
              <input id="r-role" name="role" className="mg-input" placeholder="Operations Manager" />
            </div>
            <div>
              <label className="mg-eyebrow mb-1.5 block" htmlFor="r-company">
                Company
              </label>
              <input id="r-company" name="company" className="mg-input" placeholder="Acme Pty Ltd" />
            </div>
            <div>
              <label className="mg-eyebrow mb-1.5 block" htmlFor="r-rating">
                Rating
              </label>
              <select id="r-rating" name="rating" defaultValue={5} required className="mg-input">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mg-eyebrow mb-1.5 block" htmlFor="r-quote">
              Review
            </label>
            <textarea
              id="r-quote"
              name="quote"
              rows={3}
              minLength={5}
              required
              className="mg-input"
              placeholder="What did the client say?"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-[var(--radius-mg)] bg-signal px-5 py-2 text-sm font-medium text-obsidian transition-colors hover:bg-signal-high"
          >
            Add review
          </button>
        </form>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === "all" ? "/dashboard/admin/marketing/reviews" : `?status=${f}`}
              className={cn(
                "rounded-[var(--radius-mg)] border px-3 py-1.5 text-xs transition-colors",
                filter === f
                  ? "border-signal/60 bg-graphite text-chrome-100"
                  : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
              )}
            >
              {f} ({counts[f]})
            </Link>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 py-16 text-center">
            <p className="font-display text-lg text-chrome-300">No reviews here yet</p>
            <p className="text-sm text-chrome-700">
              Use the form above to add your first review.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
            {filtered.map((r) => (
              <ReviewRow key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewRow({ review: r }: { review: Review }) {
  return (
    <article className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2 md:max-w-[65%]">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base text-chrome-100">
            {r.name}
            {r.company && <span className="text-chrome-500"> · {r.company}</span>}
          </h3>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide",
              STATUS_TONE[r.status]
            )}
          >
            {r.status}
          </span>
          <span className="text-xs text-chrome-700" aria-label={`${r.rating} out of 5 stars`}>
            {"★".repeat(r.rating)}
            <span className="text-chrome-700/50">{"★".repeat(5 - r.rating)}</span> {r.rating}/5
          </span>
        </div>
        {r.role && <p className="text-xs text-chrome-700">{r.role}</p>}
        <p className="text-sm italic leading-relaxed text-chrome-300">“{r.quote}”</p>
      </div>

      <form className="flex shrink-0 flex-wrap gap-2">
        {r.status !== "approved" && (
          <button
            formAction={setReviewStatus.bind(null, r.id, "approved")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Approve
          </button>
        )}
        {r.status !== "rejected" && (
          <button
            formAction={setReviewStatus.bind(null, r.id, "rejected")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Reject
          </button>
        )}
        {r.status !== "pending" && (
          <button
            formAction={setReviewStatus.bind(null, r.id, "pending")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Back to pending
          </button>
        )}
        <button
          formAction={removeReview.bind(null, r.id)}
          className="rounded-[var(--radius-mg)] border border-signal/30 px-3 py-1.5 text-xs text-signal hover:border-signal"
        >
          Delete
        </button>
      </form>
    </article>
  );
}
