"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, BarChart3, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { label: "Dashboard", href: "/adminj2-v1/dashboard", icon: LayoutDashboard },
  { label: "SEO", href: "/adminj2-v1/seo", icon: Search },
  { label: "Stats & Reports", href: "/adminj2-v1/stats", icon: BarChart3 },
  { label: "Autofield", href: "/adminj2-v1/autofield", icon: Wrench },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col gap-1 border-hairline md:w-60 md:border-r">
      {/* Desktop vertical bar */}
      <nav className="sticky top-20 hidden flex-col gap-1 p-4 md:flex">
        <span className="mg-eyebrow mb-2 px-3 text-chrome-700">Admin</span>
        {items.map((i) => {
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");
          const Icon = i.icon;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-mg)] px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-graphite text-chrome-100"
                  : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
              )}
            >
              <Icon size={16} className={active ? "text-signal" : ""} />
              {i.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile horizontal strip */}
      <nav className="flex gap-1 overflow-x-auto border-b border-hairline p-2 md:hidden">
        {items.map((i) => {
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");
          const Icon = i.icon;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[var(--radius-mg)] px-3 py-2 text-xs transition-colors",
                active
                  ? "bg-graphite text-chrome-100"
                  : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
              )}
            >
              <Icon size={14} className={active ? "text-signal" : ""} />
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}