"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { renderMergeTags } from "@/lib/marketing-merge-tags";

interface EmailPreviewProps {
  subject: string;
  html: string;
}

export function EmailPreview({ subject, html }: EmailPreviewProps) {
  const srcDoc = useMemo(() => {
    const rendered = renderMergeTags(html);
    const clean = DOMPurify.sanitize(rendered);
    return [
      "<!doctype html>",
      "<html>",
      "<head>",
      "<meta charset=\"utf-8\" />",
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
      "<style>",
      "body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;color:#1f2937;}",
      "img{max-width:100%;height:auto;}",
      "</style>",
      "</head>",
      `<body>${clean}</body>`,
      "</html>",
    ].join("");
  }, [html]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-4">
        <span className="mg-eyebrow">Preview</span>
        <p className="text-sm text-chrome-100">{subject || "(no subject)"}</p>
      </div>
      <iframe
        title="Email preview"
        srcDoc={srcDoc}
        sandbox=""
        className="min-h-[420px] w-full rounded-[var(--radius-mg-lg)] border border-hairline bg-white"
      />
    </div>
  );
}
