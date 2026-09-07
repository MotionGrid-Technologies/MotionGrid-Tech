"use client";

import { MARKETING_MERGE_TAGS } from "@/lib/marketing-merge-tags";

interface MergeTagToolbarProps {
  onInsert: (token: string) => void;
}

export function MergeTagToolbar({ onInsert }: MergeTagToolbarProps) {
  return (
    <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-3">
      <p className="mg-eyebrow mb-2">Merge tags</p>
      <div className="flex flex-wrap gap-1.5">
        {MARKETING_MERGE_TAGS.map((tag) => (
          <button
            key={tag.key}
            type="button"
            title={`Insert ${tag.label}`}
            onClick={() => onInsert(tag.token)}
            className="rounded-[var(--radius-mg)] border border-hairline bg-graphite/60 px-2.5 py-1 font-mono text-xs text-signal transition-colors hover:border-signal/40 hover:bg-signal/10"
          >
            {tag.token}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-chrome-700">
        Click a tag to insert it at the cursor. Preview and test sends substitute
        sample data.
      </p>
    </div>
  );
}
