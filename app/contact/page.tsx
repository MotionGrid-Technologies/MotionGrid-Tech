"use client";

import { useActionState, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { CalendarCheck, Mail, MessageSquareText, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SlotPicker } from "@/components/sections/SlotPicker";
import { founders, site } from "@/lib/site";
import posthog from "posthog-js";
import {
  bookDemoSlot,
  submitDemoRequest,
  type BookingFormState,
  type DemoFormState,
} from "@/lib/actions/dashboard";
import { isPostHogConfigured } from "@/lib/posthog";

type Mode = "slot" | "message";

export default function ContactPage() {
  const [mode, setMode] = useState<Mode>("slot");

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the people building it."
        lede="No intake queue, no account manager — every enquiry reaches one of the
        two founders directly."
      />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_1fr]">
          {/* ---------------------------------------------------------- */}
          {/* Intake — slot booking by default, classic message form      */}
          {/* as the fallback.                                            */}
          {/* ---------------------------------------------------------- */}
          <div id="demo" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Book a demo"
              title="Grab 15 minutes with a founder."
              lede="Pick a slot and the call is on both calendars instantly — or just
              send a message if you'd rather we come back with times."
              className="mb-8"
            />

            {/* Mode toggle */}
            <div className="mb-8 flex gap-2" role="tablist" aria-label="Contact method">
              <ModeTab
                active={mode === "slot"}
                onClick={() => setMode("slot")}
                icon={<CalendarCheck size={13} />}
                label="Pick a 15-min slot"
              />
              <ModeTab
                active={mode === "message"}
                onClick={() => setMode("message")}
                icon={<MessageSquareText size={13} />}
                label="Just send a message"
              />
            </div>

            {mode === "slot" ? <SlotForm /> : <MessageForm />}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Direct lines — one phone number per founder                 */}
          {/* ---------------------------------------------------------- */}
          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow="Direct lines" title="Reach us directly." />
            <div className="flex flex-col gap-6">
              {founders.map((f) => (
                <div
                  key={f.name}
                  className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-6"
                >
                  <div>
                    <h3 className="font-display text-lg text-chrome-100">{f.name}</h3>
                    <p className="mg-eyebrow mt-1">{f.role}</p>
                  </div>

                  <a
                    href={`tel:${f.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                  >
                    <Phone size={14} className="text-signal" /> {f.phone}
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                  >
                    <Mail size={14} className="text-signal" /> {f.email}
                  </a>
                </div>
              ))}

              <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-6">
                <h3 className="font-display text-lg text-chrome-100">General enquiries</h3>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-3 flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                >
                  <Mail size={14} className="text-signal" /> {site.email}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Slot booking form (primary)
// ---------------------------------------------------------------------------

function SlotForm() {
  const initialState: BookingFormState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(bookDemoSlot, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [slot, setSlot] = useState("");
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (isPostHogConfigured) posthog.capture("demo_slot_booked");
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }}
      className="flex flex-col gap-5"
    >
      <SlotPicker value={slot} onChange={setSlot} error={state.errors?.slot} />
      <input type="hidden" name="slot" value={slot} />

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
          What should we prepare before the call?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
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
        disabled={pending || !turnstileToken || !slot}
      >
        {pending ? "Booking…" : "Book the call"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Classic message-only form (fallback)
// ---------------------------------------------------------------------------

function MessageForm() {
  const initialState: DemoFormState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(submitDemoRequest, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (isPostHogConfigured) posthog.capture("demo_request_submitted");
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
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[var(--radius-mg)] border px-4 py-2.5 text-sm transition-colors ${
        active
          ? "border-signal/60 bg-graphite text-chrome-100"
          : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
      }`}
    >
      <span className={active ? "text-signal" : ""}>{icon}</span>
      {label}
    </button>
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
