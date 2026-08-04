import { cn } from "@/lib/cn";

export function FilamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px w-full", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hairline to-transparent" />
      <span className="mg-signal-dot absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
    </div>
  );
}
