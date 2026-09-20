"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import { getPostHogIfConsented } from "@/lib/posthog-client";

// Root error boundary — replaces the entire app (html/body) when a fatal
// error escapes every other boundary. Imports globals.css so the dark,
// premium MotionGrid styling applies even though the root layout is skipped.
export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
    getPostHogIfConsented().then((posthog) => {
      if (posthog) posthog.captureException(error);
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-obsidian text-chrome-200 antialiased">
        <main className="mg-brushed flex flex-1 items-center justify-center px-6 py-16 md:py-24">
          <div className="flex max-w-xl flex-col items-center gap-6 text-center">
            <p className="mg-eyebrow text-signal">Fatal error</p>
            <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">
              Something short-circuited
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-chrome-500">
              We hit an unexpected error and couldn&apos;t recover this page. You can
              try again, or head back to the homepage.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-[var(--radius-mg)] bg-signal px-6 py-3 text-sm font-medium text-obsidian transition-colors hover:bg-signal-high"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 px-6 py-3 text-sm font-medium text-chrome-100 transition-colors hover:border-chrome-500"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}