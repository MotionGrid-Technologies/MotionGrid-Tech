"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isPostHogConfigured } from "@/lib/posthog";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (isPostHogConfigured && posthog.has_opted_in_capturing()) {
      posthog.captureException(error);
    }
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center py-16 md:py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-sm tracking-[0.3em] text-signal uppercase">
          Error
        </p>
        <h1 className="max-w-2xl font-display text-4xl text-chrome-100 md:text-6xl">
          Something short-circuited
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-chrome-500">
          We hit an unexpected error while rendering this page. You can try
          again, or head back to the homepage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button href="/" variant="chrome">
            Back to homepage
          </Button>
        </div>
      </Container>
    </section>
  );
}
