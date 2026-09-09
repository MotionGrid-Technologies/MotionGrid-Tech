"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Mail,
  Newspaper,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { signOut } from "@/app/login/actions";

const items = [
  { label: "Dashboard", href: "/dashboard/admin/dashboard", icon: LayoutDashboard },
  { label: "SEO", href: "/dashboard/admin/seo", icon: Search },
  { label: "Stats & Reports", href: "/dashboard/admin/stats", icon: BarChart3 },
  { label: "Blog", href: "/dashboard/admin/marketing/blog", icon: Newspaper },
  { label: "Marketing Emails", href: "/dashboard/admin/marketing/emails", icon: Mail },
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

        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius-mg)] px-3 py-2.5 text-sm text-chrome-500 transition-colors hover:bg-graphite/60 hover:text-chrome-200"
          >
            <LogOut size={16} />
            Log out
          </button>
        </form>
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
        <form action={signOut}>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-[var(--radius-mg)] px-3 py-2 text-xs text-chrome-500 transition-colors hover:bg-graphite/60 hover:text-chrome-200"
          >
            <LogOut size={14} />
            Log out
          </button>
        </form>
      </nav>
    </aside>
  );
}