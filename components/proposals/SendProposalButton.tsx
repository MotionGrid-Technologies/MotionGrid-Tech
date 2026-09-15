"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { sendProposalAction } from "@/app/dashboard/admin/proposals/actions";

export function SendProposalButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSend() {
    startTransition(async () => {
      try {
        const token = await sendProposalAction(id);
        setPublicUrl(`${window.location.origin}/proposal/${token}`);
        setConfirming(false);
      } catch {
        setConfirming(false);
      }
    });
  }

  function handleCopy() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (publicUrl) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-4 py-2.5">
        <span className="truncate text-sm text-chrome-300">{publicUrl}</span>
        <Button type="button" variant="chrome" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-chrome-500">Send this proposal to the client?</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button type="button" variant="primary" size="sm" disabled={isPending} onClick={handleSend}>
          {isPending ? "Sending..." : "Confirm"}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" variant="primary" onClick={() => setConfirming(true)}>
      Send to Client
    </Button>
  );
}
