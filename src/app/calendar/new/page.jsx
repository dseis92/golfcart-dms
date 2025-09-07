"use client";

import { Suspense } from "react";
import CalendarNew from "./CalendarNew";

export default function CalendarNewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarNew />
    </Suspense>
  );
}
