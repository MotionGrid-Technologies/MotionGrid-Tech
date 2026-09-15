"use client";

import { useActionState, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Lock } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import posthog from "posthog-js";
import { submitDemoRequest, type DemoFormState } from "@/lib/actions/dashboard";
import { isPostHogConfigured } from "@/lib/posthog";

// The "Book a demo" enquiry form — saves to demo_requests and notifies the
// team. The 15-minute slot calendar lives next to this in BookingCalendar.
export function ContactForm() {
  const initialState: DemoFormState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(submitDemoRequest, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  return (
    <div id="demo" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Book a demo"
        title="Tell us about the problem."
        lede="Fill this in and we'll come back with times that work."
        className="mb-10"
      />
      <form
        action={formAction}
        onSubmit={() => {
          if (isPostHogConfigured) posthog.capture("demo_request_submitted");
          // Clear the token and reset the widget so the next submission
          // requires a fresh challenge (including after validation or
          // persistence failures).
          setTurnstileToken("");
          turnstileRef.current?.reset();
        }}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" error={state.errors?.name} />
          <Field label="Company" name="company" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" error={state.errors?.email} />
          <Field label="Phone" name="phone" type="tel" />
        </div>
        <div>
          <label className="mg-eyebrow mb-2 block" htmlFor="message">
            What are you trying to solve?
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-4 py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal/60"
            placeholder="A sentence or two is plenty to start."
          />
          {state.errors?.message && (
            <p className="mt-2 text-xs text-signal">{state.errors.message}</p>
          )}
        </div>
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
          options={{
            action: "demo_request",
            theme: "dark",
            size: "normal",
            responseField: false,
          }}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
        />

        {state.message && (
          <p
            aria-live="polite"
            className={state.ok ? "text-sm text-signal" : "text-sm text-chrome-500"}
          >
            {state.message}
          </p>
        )}
        <Button
          variant="primary"
          type="submit"
          className="self-start"
          disabled={pending || !turnstileToken}
        >
          {pending ? "Sending…" : "Send"}
        </Button>
      </form>
      <Link
        href="/dashboard/admin/dashboard"
        className="mt-8 inline-flex items-center gap-1.5 text-xs text-chrome-700 transition-colors hover:text-chrome-300"
      >
        <Lock size={12} /> Admin dashboard
      </Link>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mg-eyebrow mb-2 block" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-4 py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal/60"
      />
      {error && <p className="mt-2 text-xs text-signal">{error}</p>}
    </div>
  );
}
