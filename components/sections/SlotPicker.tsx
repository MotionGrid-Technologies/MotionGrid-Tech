"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { nextBookableDateKeys } from "@/lib/booking-slots";

// ---------------------------------------------------------------------------
// 15-minute slot picker (TODO Phase 3.3 — "replace generic form with a
// pick a 15-min slot flow").
//
// The grid is server-authoritative: this component only renders what
// /api/booking/availability offers for the selected SAST date. Picking a
// slot just fills the booking form's hidden `slot` input — everything is
// re-validated server-side in the bookDemoSlot action.
// ---------------------------------------------------------------------------

const DATE_TAB_COUNT = 8;

const slotTime = new Intl.DateTimeFormat("en-ZA", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Johannesburg",
});

function dateTabLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function SlotPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (slotIso: string) => void;
  error?: string;
}) {
  const dates = useMemo(() => nextBookableDateKeys(DATE_TAB_COUNT), []);
  const [activeDate, setActiveDate] = useState(dates[0] ?? "");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  function selectDate(d: string) {
    if (d === activeDate) return;
    setActiveDate(d);
    // Reset the pane synchronously in the handler (not in an effect): show
    // the spinner, clear any error, and drop a slot picked on the previous
    // day so the hidden input never carries a stale value.
    setLoading(true);
    setLoadError("");
    onChange("");
  }

  useEffect(() => {
    if (!activeDate) return;
    let cancelled = false;

    fetch(`/api/booking/availability?date=${activeDate}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("availability fetch failed");
        const data = (await res.json()) as { slots: string[] };
        if (!cancelled) setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setLoadError("Could not load times — try another day or just send a message.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeDate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Date tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => selectDate(d)}
            aria-pressed={d === activeDate}
            className={`flex shrink-0 items-center gap-1.5 rounded-[var(--radius-mg)] border px-3 py-2 text-xs transition-colors ${
              d === activeDate
                ? "border-signal/60 bg-graphite text-chrome-100"
                : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
            }`}
          >
            <CalendarDays size={12} className={d === activeDate ? "text-signal" : ""} />
            {dateTabLabel(d)}
          </button>
        ))}
      </div>

      {/* Slot grid */}
      <div className="rounded-[var(--radius-mg)] border border-hairline bg-graphite/40 p-4">
        {loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-chrome-700">
            <Loader2 size={14} className="animate-spin" /> Loading times…
          </p>
        ) : loadError ? (
          <p className="py-6 text-sm text-chrome-500">{loadError}</p>
        ) : slots.length === 0 ? (
          <p className="py-6 text-sm text-chrome-700">
            No open times left on this day — try the next tab.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((iso) => {
              const selected = iso === value;
              const time = slotTime.format(new Date(iso));
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onChange(iso)}
                  aria-pressed={selected}
                  className={`flex items-center justify-center gap-1 rounded-[var(--radius-mg)] border px-2 py-2 text-xs transition-colors ${
                    selected
                      ? "border-signal bg-signal/10 text-chrome-100"
                      : "border-hairline text-chrome-500 hover:border-chrome-700 hover:text-chrome-300"
                  }`}
                >
                  <Clock size={11} className={selected ? "text-signal" : ""} />
                  {time}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-[0.7rem] text-chrome-700">
          All times South Africa (SAST) · 15 minutes · a calendar invite lands in
          your inbox when you book.
        </p>
      </div>

      {error && <p className="text-xs text-signal">{error}</p>}
    </div>
  );
}
