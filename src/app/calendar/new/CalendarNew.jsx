"use client";

import { useSearchParams } from "next/navigation";

export default function CalendarNew() {
  const params = useSearchParams();
  const view = params.get("view") || "month";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
      <p className="text-sm text-zinc-600">Current view: {view}</p>
    </div>
  );
}
