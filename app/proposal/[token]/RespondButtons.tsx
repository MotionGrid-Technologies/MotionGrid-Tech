"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { respondToProposalAction } from "./actions";

export function RespondButtons({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<"approved" | "rejected" | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function respond(response: "approved" | "rejected") {
    startTransition(async () => {
      const outcome = await respondToProposalAction(token, response);
      setResult(outcome);
      setConfirming(null);
      if (outcome.ok) router.refresh();
    });
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-8">
        <p
          className={`text-sm leading-relaxed ${result.ok ? "text-signal" : "text-chrome-500"}`}
          aria-live="polite"
        >
          {result.message}
        </p>
        {!result.ok && (
          <Button type="button" variant="chrome" size="sm" onClick={() => setResult(null)}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-8">
        <p className="text-sm text-chrome-300">
          {confirming === "approved"
            ? "Confirming approval tells us to start your project — you’ll hear from a founder within one business day."
            : "Decline this proposal? Nothing is deleted — we can revise and resend if the fit isn’t right yet."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(null)}>
            Back
          </Button>
          <Button
            type="button"
            variant={confirming === "approved" ? "primary" : "chrome"}
            size="sm"
            disabled={isPending}
            onClick={() => respond(confirming)}
          >
            {isPending
              ? "Recording…"
              : confirming === "approved"
                ? "Confirm approval"
                : "Confirm decline"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-8">
      <h2 className="font-display text-2xl text-chrome-100">Ready to proceed?</h2>
      <p className="text-sm leading-relaxed text-chrome-500">
        Review the proposal above. If everything looks good, approve it and we&apos;ll set your
        project up automatically — or decline and we&apos;ll revise.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" onClick={() => setConfirming("approved")}>
          <Check size={16} />
          Approve Proposal
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirming("rejected")}>
          <X size={16} />
          Decline
        </Button>
      </div>
    </div>
  );
}
