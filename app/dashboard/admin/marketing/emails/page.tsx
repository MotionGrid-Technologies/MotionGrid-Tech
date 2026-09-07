import Link from "next/link";
import { Mail } from "lucide-react";
import { NewEmailButton } from "@/components/marketing/NewEmailButton";
import { listMarketingEmails } from "@/lib/marketing-emails-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketing Emails",
  robots: { index: false, follow: false },
};

export default async function MarketingEmailsPage() {
  const emails = await listMarketingEmails();

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl text-chrome-100">Marketing emails</h1>
            <p className="text-sm text-chrome-500">
              Draft, preview, and test-send MotionGrid marketing emails.
            </p>
          </div>
          <NewEmailButton />
        </header>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-16 text-center">
            <Mail size={28} className="text-chrome-700" />
            <p className="text-sm text-chrome-500">No marketing emails yet.</p>
            <p className="text-xs text-chrome-700">
              Create your first email to start drafting.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
            {emails.map((e) => (
              <Link
                key={e.id}
                href={`/dashboard/admin/marketing/emails/${e.id}`}
                className="flex flex-col gap-1 p-5 transition-colors hover:bg-graphite/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-display text-lg text-chrome-100">
                    {e.name || "(untitled)"}
                  </span>
                  <span
                    className={
                      "rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide " +
                      (e.status === "sent"
                        ? "text-chrome-300 border-chrome-500"
                        : "text-chrome-700 border-hairline")
                    }
                  >
                    {e.status}
                  </span>
                </div>
                <span className="text-sm text-chrome-500">
                  {e.subject || "(no subject)"}
                </span>
                <span className="text-xs text-chrome-700">
                  Updated {new Date(e.updated_at).toLocaleString("en-ZA")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
