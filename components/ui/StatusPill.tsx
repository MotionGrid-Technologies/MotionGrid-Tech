import { cn } from "@/lib/cn";

export function StatusPill({ status }: { status: "active" | "soon" }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "mg-eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1",
        isActive ? "border-signal/40 text-signal" : "border-hairline text-chrome-700"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "mg-signal-dot bg-signal" : "bg-chrome-700"
        )}
      />
      {isActive ? "Active" : "Coming soon"}
    </span>
  );
}
