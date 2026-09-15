"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { BookableDay, BookableSlot } from "@/lib/meetings-store";
import { bookMeetingAction, getSlotsAction, type BookingState } from "@/app/contact/actions";

// ---------------------------------------------------------------------------
// 15-minute booking calendar. Slot availability comes from the server
// (lib/meetings-store.ts) — this component only selects and submits.
// ---------------------------------------------------------------------------

const INITIAL_STATE: BookingState = { ok: false, message: "" };

export function BookingCalendar({
  days,
  initialDay,
  initialSlots,
}: {
  days: BookableDay[];
  initialDay: string;
  initialSlots: BookableSlot[];
}) {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [slots, setSlots] = useState<BookableSlot[]>(initialSlots);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(bookMeetingAction, INITIAL_STATE);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  // The success state object we've already reflected in the UI — guards the
  // effect below against re-confirming when unrelated state (day/slot/confirmed)
  // changes.
  const handledStateRef = useRef<BookingState | null>(null);

  async function selectDay(iso: string) {
    if (iso === selectedDay || loadingSlots) return;
    setSelectedDay(iso);
    setSelectedSlot(null);
    setConfirmed(null);
    setLoadingSlots(true);
    try {
      setSlots(await getSlotsAction(iso));
    } finally {
      setLoadingSlots(false);
    }
  }

  // After a successful booking, drop the selection and refresh the day's
  // slots so the taken one disappears from the grid. setState lives in the
  // async continuation (not the effect body) — external-system sync pattern.
  useEffect(() => {
    if (!state.ok || handledStateRef.current === state) return;
    handledStateRef.current = state;
    let cancelled = false;
    getSlotsAction(selectedDay)
      .then((fresh) => {
        if (cancelled) return;
        setSlots(fresh);
        setSelectedSlot(null);
        setConfirmed(state.message);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedSlot(null);
        setConfirmed(state.message);
      });
    return () => {
      cancelled = true;
    };
  }, [state, selectedDay]);

  const slotLabel = selectedSlot ? selectedSlot.slice(11, 16) : null;

  return (
    <div className="flex flex-col gap-8 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-6 md:p-8">
      {/* Day picker ------------------------------------------------------- */}
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((day) => {
          const active = day.iso === selectedDay;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => selectDay(day.iso)}
              aria-pressed={active}
              className={cn(
                "flex w-[72px] shrink-0 flex-col items-center gap-0.5 rounded-[var(--radius-mg)] border px-2 py-3 transition-colors",
                active
                  ? "border-signal bg-signal/10 text-chrome-100"
                  : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-200"
              )}
            >
              <span className="mg-eyebrow text-[0.625rem]">{day.weekday}</span>
              <span className="font-display text-xl leading-none text-chrome-100">
                {day.dayNumber}
              </span>
              <span className="mg-eyebrow text-[0.625rem]">{day.month}</span>
            </button>
          );
        })}
      </div>

      {/* Slot grid -------------------------------------------------------- */}
      {loadingSlots ? (
        <p className="text-sm text-chrome-500">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-chrome-500">
          No open 15-minute slots on this day — try the next one.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {slots.map((slot) => {
            const active = slot.iso === selectedSlot;
            return (
              <button
                key={slot.iso}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot.iso);
                  setConfirmed(null);
                }}
                aria-pressed={active}
                className={cn(
                  "rounded-[var(--radius-mg)] border px-2 py-2 font-mono text-xs tracking-wider transition-colors",
                  active
                    ? "border-signal bg-signal text-obsidian"
                    : "border-hairline text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
                )}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Booking form ----------------------------------------------------- */}
      {selectedSlot && !confirmed && (
        <form
          action={formAction}
          onSubmit={() => {
            // Require a fresh challenge on the next submission attempt.
            setTurnstileToken("");
            turnstileRef.current?.reset();
          }}
          className="flex flex-col gap-5 border-t border-hairline pt-6"
        >
          <p className="text-sm text-chrome-300">
            Booking <span className="font-mono text-signal">{slotLabel}</span> — 15 minutes with a
            founder, over the phone or a video call.
          </p>
          <input type="hidden" name="slot" value={selectedSlot} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" name="name" error={state.errors?.name} />
            <Field label="Company" name="company" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email" name="email" type="email" error={state.errors?.email} />
            <Field label="Phone" name="phone" type="tel" />
          </div>
          <div>
            <label className="mg-eyebrow mb-2 block" htmlFor="notes">
              What should we prepare? (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-4 py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal/60"
              placeholder="A sentence or two is plenty to start."
            />
          </div>

          <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
            options={{
              action: "meeting_booking",
              theme: "dark",
              size: "normal",
              responseField: false,
            }}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
          />

          {state.message && !state.ok && (
            <p aria-live="polite" className="text-sm text-chrome-500">
              {state.message}
            </p>
          )}
          <Button
            variant="primary"
            type="submit"
            className="self-start"
            disabled={pending || !turnstileToken}
          >
            {pending ? "Booking…" : "Confirm slot"}
          </Button>
        </form>
      )}

      {/* Confirmation ----------------------------------------------------- */}
      {confirmed && (
        <div className="flex items-start gap-3 rounded-[var(--radius-mg-lg)] border border-signal/30 bg-signal/5 p-5">
          <CalendarCheck size={18} className="mt-0.5 shrink-0 text-signal" />
          <p className="text-sm leading-relaxed text-chrome-300">{confirmed}</p>
        </div>
      )}
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
      <label className="mg-eyebrow mb-2 block" htmlFor={`booking-${name}`}>
        {label}
      </label>
      <input
        id={`booking-${name}`}
        name={name}
        type={type}
        className="w-full rounded-[var(--radius-mg)] border border-hairline bg-graphite/50 px-4 py-3 text-sm text-chrome-100 placeholder:text-chrome-700 focus:border-signal/60"
      />
      {error && <p className="mt-2 text-xs text-signal">{error}</p>}
    </div>
  );
}
