"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import {
  addDays, endOfMonth, fmtDay, isSameDay, listenEventsBetween,
  startOfCalendarGrid, startOfMonth
} from "@/lib/calendar";

const TYPE_STYLES = {
  service: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  rental: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  delivery: "bg-green-100 text-green-800 ring-1 ring-green-200",
  other: "bg-zinc-200 text-zinc-800 ring-1 ring-zinc-300"
};

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  // subscribe for visible month
  useEffect(() => {
    const from = startOfMonth(cursor);
    const to = new Date(endOfMonth(cursor).getTime()+1);
    const unsub = listenEventsBetween(
      Timestamp.fromDate(from),
      Timestamp.fromDate(to),
      setEvents,
      (err) => { console.error(err); setError(err.message || "Failed to load"); setEvents([]); }
    );
    return () => unsub();
  }, [cursor]);

  const grid = useMemo(() => {
    const days = [];
    const start = startOfCalendarGrid(cursor);
    for (let i = 0; i < 42; i++) days.push(addDays(start, i));
    return days;
  }, [cursor]);

  const today = new Date(); today.setHours(0,0,0,0);
  const monthLabel = cursor.toLocaleDateString(undefined, { month:"long", year:"numeric" });

  return (
    <div className="page space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="header-title">{monthLabel}</h1>
          <p className="header-sub">Schedule service, rentals, and deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => setCursor(new Date())}>Today</button>
          <button
            className="btn"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            ‹ Prev
          </button>
          <button
            className="btn"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            Next ›
          </button>
          <Link href="/calendar/new" className="btn btn-primary">New Event</Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-soft">
        <LegendDot className="bg-blue-500" label="Service" />
        <LegendDot className="bg-amber-500" label="Rental" />
        <LegendDot className="bg-green-500" label="Delivery" />
        <LegendDot className="bg-zinc-500" label="Other" />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {events === null ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : (
        <div className="rounded-xl border bg-surface p-3 shadow-card">
          {/* Weekday header row */}
          <div className="grid grid-cols-7 gap-2 px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-text-soft">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-2">
            {grid.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const dayEventsAll = events.filter(e => {
                const sd = e.start?.toDate?.() || new Date(e.start);
                return isSameDay(sd, d);
              });
              const dayEvents = dayEventsAll.slice(0, 4);
              const extra = dayEventsAll.length - dayEvents.length;

              const baseCell =
                "relative rounded-xl border p-2 transition-shadow bg-white " +
                (isWeekend ? "bg-surface-strong " : "") +
                (inMonth ? "opacity-100" : "opacity-60");

              const isToday = isSameDay(d, today);

              return (
                <div key={i} className={baseCell + " hover:shadow-card"}>
                  {/* Date + add link */}
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className={[
                        "grid h-6 w-6 place-items-center rounded-full text-[11px]",
                        isToday ? "ring-2 ring-brand-600 font-semibold text-brand-700" : "text-text-soft"
                      ].join(" ")}
                      title={d.toDateString()}
                    >
                      {d.getDate()}
                    </div>
                    <Link
                      href={{ pathname: "/calendar/new", query: { date: d.toISOString() } }}
                      className="text-[11px] text-brand-700 hover:underline"
                    >
                      add
                    </Link>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.map(ev => (
                      <Link
                        key={ev.id}
                        href={`/calendar/${ev.id}`}
                        className={[
                          "block truncate rounded-md px-2 py-1 text-[11px] font-medium",
                          TYPE_STYLES[ev.type] || TYPE_STYLES.other
                        ].join(" ")}
                        title={ev.title}
                      >
                        {ev.title}
                      </Link>
                    ))}
                    {extra > 0 && (
                      <div className="text-[11px] text-text-soft">+ {extra} more…</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ className = "", label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      <span>{label}</span>
    </span>
  );
}
