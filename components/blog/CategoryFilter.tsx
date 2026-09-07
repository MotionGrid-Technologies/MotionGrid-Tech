"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface CategoryFilterProps {
  categories: { slug: string; name: string }[];
  current: string;
}

export function CategoryFilter({ categories, current }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  }

  return (
    <div className="relative inline-block min-w-[220px]">
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 py-2.5 pl-3 pr-9 text-sm text-chrome-100 focus:border-signal focus:outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-chrome-500"
      />
    </div>
  );
}
