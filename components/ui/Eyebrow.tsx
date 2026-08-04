import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
  withNode = true,
}: {
  children: React.ReactNode;
  className?: string;
  withNode?: boolean;
}) {
  return (
    <div className={cn("mg-eyebrow flex items-center gap-2.5", className)}>
      {withNode && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="mg-signal-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
      )}
      {children}
    </div>
  );
}
