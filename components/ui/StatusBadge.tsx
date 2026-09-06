import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-grey-lightest text-grey-dark border-grey-medium/20",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  proposed: "bg-blue-100 text-blue-800 border-blue-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-primary/10 text-primary border-primary/30",
  accepted: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  awaiting_parts: "bg-amber-100 text-amber-800 border-amber-200",
  ready_for_pickup: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  declined: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[status] ??
          "bg-grey-lightest text-grey-dark border-grey-medium/20"
      )}
    >
      <span className="capitalize">{status.replace(/_/g, " ")}</span>
    </span>
  );
}
