import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Branded loading state for /blog. Mirrors the page layout: hero post card
// then a grid of post cards, all as dark skeletons.
export default function BlogLoading() {
  return (
    <div className="py-16 md:py-24">
      <Container className="flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <Skeleton tone="dark" className="h-4 w-24" />
          <Skeleton tone="dark" className="h-10 w-72 max-w-full" />
          <Skeleton tone="dark" className="h-4 w-96 max-w-full" />
        </header>

        {/* Hero post */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 lg:grid-cols-2">
          <Skeleton tone="dark" className="aspect-[16/9] h-full w-full rounded-none lg:min-h-[340px]" />
          <div className="flex flex-col justify-center gap-4 p-6">
            <Skeleton tone="dark" className="h-4 w-24" />
            <Skeleton tone="dark" className="h-8 w-4/5" />
            <Skeleton tone="dark" className="h-4 w-full" />
            <Skeleton tone="dark" className="h-4 w-3/4" />
          </div>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5"
            >
              <Skeleton tone="dark" className="aspect-[16/9] w-full" />
              <Skeleton tone="dark" className="h-4 w-20" />
              <Skeleton tone="dark" className="h-6 w-4/5" />
              <Skeleton tone="dark" className="h-4 w-full" />
              <Skeleton tone="dark" className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}