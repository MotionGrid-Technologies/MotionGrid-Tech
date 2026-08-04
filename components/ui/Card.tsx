import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  as: Comp = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "article" | "li";
}) {
  return (
    <Comp
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/60 p-8 transition-colors duration-300 hover:border-chrome-700",
        className
      )}
    >
      {/* corner sheen — appears on hover, echoes brushed metal */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-chrome-100/0 blur-2xl transition-colors duration-500 group-hover:bg-chrome-100/[0.06]" />
      {children}
    </Comp>
  );
}

export function EmptyCard({
  label,
  note,
  className,
}: {
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[var(--radius-mg-lg)] border border-dashed border-hairline bg-transparent p-8 text-center",
        className
      )}
    >
      <span className="mg-eyebrow text-chrome-700">{label}</span>
      {note && <p className="max-w-xs text-sm text-chrome-700">{note}</p>}
    </div>
  );
}
