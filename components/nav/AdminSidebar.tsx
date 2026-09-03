"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { label: "Dashboard", href: "/adminj2-v1/dashboard", icon: LayoutDashboard },
  { label: "SEO", href: "/adminj2-v1/seo", icon: Search },
  { label: "Stats & Reports", href: "/adminj2-v1/stats", icon: BarChart3 },
];

const autofieldChildren = [
  { label: "Overview", href: "/adminj2-v1/autofield" },
  { label: "All Workshops", href: "/adminj2-v1/autofield/workshops" },
  { label: "New Workshops", href: "/adminj2-v1/autofield/workshops?new=true" },
  { label: "All Users", href: "/adminj2-v1/autofield/users" },
  { label: "Workshop Settings", href: "/adminj2-v1/autofield/settings" },
  { label: "SEO Registry", href: "/adminj2-v1/autofield/seo" },
  { label: "Stats n Reports", href: "/adminj2-v1/autofield/stats" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const autofieldActive =
    pathname === "/adminj2-v1/autofield" ||
    pathname.startsWith("/adminj2-v1/autofield/");
  const [autofieldOpen, setAutofieldOpen] = useState(autofieldActive);

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

        {/* Autofield — click toggles the sub-menu */}
        <button
          type="button"
          onClick={() => setAutofieldOpen((v) => !v)}
          aria-expanded={autofieldOpen}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-mg)] px-3 py-2.5 text-sm transition-colors",
            autofieldActive
              ? "bg-graphite text-chrome-100"
              : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
          )}
        >
          <Wrench size={16} className={autofieldActive ? "text-signal" : ""} />
          <span className="flex-1 text-left">Autofield</span>
          <ChevronDown
            size={14}
            className={cn(
              "text-chrome-700 transition-transform duration-200",
              !autofieldOpen && "-rotate-90"
            )}
          />
        </button>
        {autofieldOpen && (
          <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-hairline pl-3">
            {autofieldChildren.map((c) => {
              const active = pathname === c.href.split("?")[0];
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className={cn(
                    "block rounded-[var(--radius-mg)] px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-graphite text-chrome-100"
                      : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
                  )}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        )}
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
        <button
          type="button"
          onClick={() => setAutofieldOpen((v) => !v)}
          aria-expanded={autofieldOpen}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-[var(--radius-mg)] px-3 py-2 text-xs transition-colors",
            autofieldActive
              ? "bg-graphite text-chrome-100"
              : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
          )}
        >
          <Wrench size={14} className={autofieldActive ? "text-signal" : ""} />
          Autofield
          <ChevronDown
            size={12}
            className={cn(
              "text-chrome-700 transition-transform duration-200",
              !autofieldOpen && "-rotate-90"
            )}
          />
        </button>
        {autofieldOpen &&
          autofieldChildren.map((c) => {
            const active = pathname === c.href.split("?")[0];
            return (
              <Link
                key={c.href}
                href={c.href}
                className={cn(
                  "block shrink-0 rounded-[var(--radius-mg)] px-3 py-2 text-xs transition-colors",
                  active
                    ? "bg-graphite text-chrome-100"
                    : "text-chrome-500 hover:bg-graphite/60 hover:text-chrome-200"
                )}
              >
                {c.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
