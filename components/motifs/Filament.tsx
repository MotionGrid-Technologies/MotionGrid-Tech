import { cn } from "@/lib/cn";

/**
 * The Filament — MotionGrid's signature visual device.
 * Three brushed-chrome strands converge from a single point, mirroring the
 * circuit lines in the wordmark. One node glows signal-orange: the one
 * "live" thing on the page. Used behind the hero and, in slimmer form,
 * as the divider between major sections (see FilamentDivider).
 */
export function Filament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 700"
      fill="none"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mg-chrome-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f5f6" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#8a8e96" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f4f5f6" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="mg-signal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f2761d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f2761d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M -50 560 C 250 560, 320 300, 560 220 S 950 120, 1250 90"
        stroke="url(#mg-chrome-stroke)"
        strokeWidth="1.5"
      />
      <path
        d="M -50 620 C 280 640, 380 380, 640 300 S 980 200, 1250 190"
        stroke="url(#mg-chrome-stroke)"
        strokeWidth="1.5"
      />
      <path
        d="M -50 500 C 220 460, 300 240, 520 160 S 900 60, 1250 30"
        stroke="url(#mg-chrome-stroke)"
        strokeWidth="1"
      />

      {/* nodes */}
      <circle cx="1250" cy="90" r="7" fill="#dfe1e4" />
      <circle cx="1250" cy="190" r="6" fill="#8a8e96" />
      <circle cx="-50" cy="620" r="6" fill="#8a8e96" />

      {/* the one signal node */}
      <circle cx="900" cy="230" r="26" fill="url(#mg-signal-glow)" />
      <circle cx="900" cy="230" r="8" fill="#f2761d" />
    </svg>
  );
}
