"use client";
import { useState } from "react";
import WorkOrderDrawer from "./WorkOrderDrawer";

export default function ServiceBoardCard({ wo }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border bg-white p-3 text-left shadow-sm hover:shadow"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">WO #{wo.id?.slice(-6) || "—"}</div>
          <span className={[
            "rounded-full px-2 py-0.5 text-xs",
            wo.priority === "high" ? "bg-red-100 text-red-700" :
            wo.priority === "low" ? "bg-zinc-100 text-zinc-700" :
            "bg-amber-100 text-amber-800"
          ].join(" ")}>
            {wo.priority || "normal"}
          </span>
        </div>
        <div className="mt-2 text-sm">
          <div className="font-medium">{wo.customer?.name || "Walk-in"}</div>
          <div className="text-zinc-600">
            {wo.concern || "No concern provided"}
          </div>
        </div>
        {wo.cartId ? <div className="mt-2 text-xs text-zinc-500">Cart: {wo.cartId}</div> : null}
      </button>

      {open ? <WorkOrderDrawer workOrderId={wo.id} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
