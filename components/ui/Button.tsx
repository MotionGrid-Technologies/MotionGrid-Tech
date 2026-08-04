import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-mg)] px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus-visible:outline-offset-4 disabled:opacity-40 disabled:pointer-events-none";

const variants = {
  primary: "bg-signal text-obsidian hover:bg-[var(--color-signal-high)]",
  chrome:
    "border border-hairline text-chrome-100 hover:border-chrome-500 hover:text-chrome-100 bg-graphite/40",
  ghost: "text-chrome-300 hover:text-chrome-100",
};

type Variant = keyof typeof variants;

type ButtonProps = {
  variant?: Variant;
  className?: string;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({ variant = "chrome", className, href, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
