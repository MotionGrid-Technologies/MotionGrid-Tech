import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-chrome-500">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-chrome-700" />}
            {c.href && !last ? (
              <Link
                href={c.href}
                className="tracking-wide uppercase transition-colors hover:text-chrome-100"
              >
                {c.label}
              </Link>
            ) : (
              <span
                className={
                  last
                    ? "tracking-wide uppercase text-chrome-100"
                    : "tracking-wide uppercase"
                }
              >
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}