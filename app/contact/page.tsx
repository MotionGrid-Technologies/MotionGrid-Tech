"use client";

import { useActionState } from "react";
import { Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { founders, site } from "@/lib/site";
import { submitDemoRequest, type DemoFormState } from "../adminj2-v1/actions";

export default function ContactPage() {
  const initialState: DemoFormState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(submitDemoRequest, initialState);

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
          {/* Demo / contact-sales form — saves to the adminj2-v1 store.   */}
          {/* ---------------------------------------------------------- */}
          <div id="demo" className="scroll-mt-24">
            <SectionHeading
              eyebrow="Book a demo"
              title="Tell us about the problem."
              lede="Fill this in and we'll come back with times that work."
              className="mb-10"
            />
            <form action={formAction} className="flex flex-col gap-5">
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
              {state.message && (
                <p
                  aria-live="polite"
                  className={state.ok ? "text-sm text-signal" : "text-sm text-chrome-500"}
                >
                  {state.message}
                </p>
              )}
              <Button variant="primary" type="submit" className="self-start" disabled={pending}>
                {pending ? "Sending…" : "Send"}
              </Button>
            </form>
            <Link
              href="/adminj2-v1/dashboard"
              className="mt-8 inline-flex items-center gap-1.5 text-xs text-chrome-700 transition-colors hover:text-chrome-300"
            >
              <Lock size={12} /> Admin dashboard
            </Link>
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
