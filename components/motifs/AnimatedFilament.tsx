"use client";

import { cn } from "@/lib/cn";
import { useRef, useEffect, useCallback } from "react";

const TRAVEL_PATH =
  "M -50 620 C 280 640, 380 380, 640 300 S 980 200, 1250 190";

export function AnimatedFilament({ className }: { className?: string }) {
  const nodeRef = useRef<SVGGElement>(null);

  const handleScroll = useCallback(() => {
    if (!nodeRef.current) return;
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const clamped = Math.min(Math.max(progress, 0), 1);
    nodeRef.current.style.offsetDistance = `${50 + clamped * 50}%`;
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <svg
      viewBox="0 0 1200 700"
      fill="none"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mg-chrome-stroke-anim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-chrome-100)" stopOpacity="0.65" />
          <stop offset="50%" stopColor="var(--color-chrome-500)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-chrome-100)" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="mg-signal-glow-anim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M -50 560 C 250 560, 320 300, 560 220 S 950 120, 1250 90"
        stroke="url(#mg-chrome-stroke-anim)"
        strokeWidth="1.5"
      />
      <path
        d={TRAVEL_PATH}
        stroke="url(#mg-chrome-stroke-anim)"
        strokeWidth="1.5"
      />
      <path
        d="M -50 500 C 220 460, 300 240, 520 160 S 900 60, 1250 30"
        stroke="url(#mg-chrome-stroke-anim)"
        strokeWidth="1"
      />

      <circle cx="1250" cy="90" r="7" fill="var(--color-chrome-200)" />
      <circle cx="1250" cy="190" r="6" fill="var(--color-chrome-500)" />
      <circle cx="-50" cy="620" r="6" fill="var(--color-chrome-500)" />

      <g
        ref={nodeRef}
        className="mg-filament-node"
        style={{
          offsetPath: `path('${TRAVEL_PATH}')`,
          offsetDistance: "50%",
        }}
      >
        <circle r="26" fill="url(#mg-signal-glow-anim)" />
        <circle r="8" fill="var(--color-signal)" />
      </g>
    </svg>
  );
}
