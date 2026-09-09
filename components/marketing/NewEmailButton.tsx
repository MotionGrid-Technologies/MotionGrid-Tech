"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export function NewEmailButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/marketing-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled email",
          subject: "",
          html_body: "<p></p>",
        }),
      });
      if (!res.ok) throw new Error("Failed to create email");
      const data = await res.json();
      router.push(`/dashboard/admin/marketing/emails/${data.email.id}`);
    } catch {
      setCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={creating}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90 disabled:opacity-50"
    >
      {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
      New email
    </button>
  );
}
