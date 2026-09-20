import { cn } from "@/lib/cn";

// `tone` switches between the light admin surfaces (bg-grey-light) and the
// dark public site (bg-graphite-high) so skeletons sit correctly in either.
export function Skeleton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-base",
        tone === "dark" ? "bg-graphite-high" : "bg-grey-light",
        className
      )}
    />
  );
}
