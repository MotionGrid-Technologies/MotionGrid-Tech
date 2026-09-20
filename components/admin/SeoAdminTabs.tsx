"use client";

import { useState } from "react";
import { SeoScorer, type SeoPost } from "@/components/admin/SeoScorer";
import { PageSeoTable, type SeoPage } from "@/components/admin/PageSeoTable";
import type { PageSeoOverride } from "@/lib/page-seo-store";

type Tab = "pages" | "blog";

interface SeoAdminTabsProps {
  posts: SeoPost[];
  pages: SeoPage[];
  overrides: PageSeoOverride[];
}

export function SeoAdminTabs({ posts, pages, overrides }: SeoAdminTabsProps) {
  const [tab, setTab] = useState<Tab>("pages");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2" role="tablist" aria-label="SEO tools">
        <TabButton active={tab === "pages"} onClick={() => setTab("pages")} label="Public pages" />
        <TabButton active={tab === "blog"} onClick={() => setTab("blog")} label="Blog posts" />
      </div>

      {tab === "pages" ? (
        <PageSeoTable pages={pages} overrides={overrides} />
      ) : (
        <SeoScorer posts={posts} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[var(--radius-mg)] border px-4 py-2.5 text-sm transition-colors ${
        active
          ? "border-signal/60 bg-graphite text-chrome-100"
          : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
      }`}
    >
      {label}
    </button>
  );
}