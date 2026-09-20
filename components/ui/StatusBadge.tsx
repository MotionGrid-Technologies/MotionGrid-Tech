import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<string, string> = {
  // Public site statuses (dark theme)
  active: "border-signal/40 text-signal",
  soon: "border-hairline text-chrome-700",
  // Admin statuses (light theme)
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

// "active"/"soon" are the public marketing statuses (rendered with the signal
// dot and eyebrow type); everything else is an admin status.
function isPublicStatus(status: string): boolean {
  return status === "active" || status === "soon";
}

/** Renders a status label using the public or administrative visual treatment. */
export function StatusBadge({ status }: { status: string }) {
  const publicStatus = isPublicStatus(status);
  const isActive = status === "active";
  const label = publicStatus
    ? isActive
      ? "Active"
      : "Coming soon"
    : status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs",
        publicStatus ? "mg-eyebrow" : "font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-grey-lightest text-grey-dark border-grey-medium/20"
      )}
    >
      {publicStatus && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isActive ? "mg-signal-dot bg-signal" : "bg-chrome-700"
          )}
        />
      )}
      {label}
    </span>
  );
}
