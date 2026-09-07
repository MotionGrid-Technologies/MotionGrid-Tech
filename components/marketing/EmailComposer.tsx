"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Save, Send, Trash2 } from "lucide-react";
import { EmailEditor, type EmailEditorHandle } from "@/components/marketing/EmailEditor";
import { MergeTagToolbar } from "@/components/marketing/MergeTagToolbar";
import { EmailPreview } from "@/components/marketing/EmailPreview";

interface EmailComposerProps {
  id: string;
  initial: {
    name: string;
    subject: string;
    html_body: string;
    text_body: string | null;
  };
}

type Feedback = { ok: boolean; text: string } | null;

export function EmailComposer({ id, initial }: EmailComposerProps) {
  const router = useRouter();
  const editorRef = useRef<EmailEditorHandle>(null);

  const [name, setName] = useState(initial.name);
  const [subject, setSubject] = useState(initial.subject);
  const [html, setHtml] = useState(initial.html_body);
  const [previewing, setPreviewing] = useState(false);
  const [testTo, setTestTo] = useState("hi@motiongrid.co.za");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/marketing-emails/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, html_body: html }),
      });
      if (!res.ok) throw new Error("Save failed");
      setFeedback({ ok: true, text: "Saved." });
    } catch {
      setFeedback({ ok: false, text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/marketing-emails/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setFeedback({ ok: true, text: `Test sent to ${testTo}.` });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : "Failed to send test.",
      });
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this email? This cannot be undone.")) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/marketing-emails/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/dashboard/admin/marketing/emails");
      router.refresh();
    } catch {
      setFeedback({ ok: false, text: "Failed to delete." });
      setDeleting(false);
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <Link
            href="/dashboard/admin/marketing/emails"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-chrome-500 hover:text-chrome-100"
          >
            <ArrowLeft size={14} /> Marketing emails
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-3xl text-chrome-100">Edit email</h1>
              <p className="text-sm text-chrome-500">
                Draft, preview, and test-send a MotionGrid marketing email.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewing((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-3 py-2 text-sm text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
              >
                {previewing ? <EyeOff size={15} /> : <Eye size={15} />}
                {previewing ? "Edit" : "Preview"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] border border-signal/30 px-3 py-2 text-sm text-signal hover:border-signal"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-mg)] bg-signal px-4 py-2 text-sm font-semibold text-black hover:bg-signal/90"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save
              </button>
            </div>
          </div>
        </header>

        {feedback && (
          <p
            className={
              "rounded-[var(--radius-mg)] border px-4 py-2.5 text-sm " +
              (feedback.ok
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-red-500/30 bg-red-500/10 text-red-400")
            }
          >
            {feedback.text}
          </p>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Internal name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. March newsletter"
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal focus:outline-none"
            />
          </Field>
          <Field label="Subject line">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-3 py-2.5 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal focus:outline-none"
            />
          </Field>
        </div>

        {/* Editor / Preview */}
        {previewing ? (
          <EmailPreview subject={subject} html={html} />
        ) : (
          <div className="flex flex-col gap-4">
            <MergeTagToolbar
              onInsert={(token) => editorRef.current?.insertMergeTag(token)}
            />
            <EmailEditor
              ref={editorRef}
              initialHtml={html}
              onChange={setHtml}
            />
          </div>
        )}

        {/* Test send */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-4">
          <span className="mg-eyebrow">Test send</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/60 px-3 py-2.5 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal focus:outline-none sm:max-w-xs"
            />
            <button
              type="button"
              onClick={handleSendTest}
              disabled={sending || !testTo}
              className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-mg)] border border-hairline px-4 py-2.5 text-sm text-chrome-100 hover:border-signal hover:text-signal disabled:opacity-50"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Send test
            </button>
          </div>
          <p className="text-xs text-chrome-700">
            Sends a single test email with sample merge data substituted. Replies
            go to hi@motiongrid.co.za.
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="mg-eyebrow">{label}</span>
      {children}
    </label>
  );
}
