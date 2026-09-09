"use client"

import { useEffect } from "react"
import posthog from "posthog-js"
import { isPostHogConfigured } from "@/lib/posthog"

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    if (isPostHogConfigured && posthog.has_opted_in_capturing()) {
      posthog.captureException(error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <p>We encountered an unexpected error. Please try again.</p>
          <button onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  )
}
