import { Skeleton } from "@/components/ui/Skeleton";

// Loading state for the admin dashboard segment. Renders inside the admin
// layout's content area (beside the sidebar) as light-surface skeletons.
export default function DashboardLoading() {
  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </header>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        {/* List card */}
        <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-graphite/40 p-6">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 py-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}