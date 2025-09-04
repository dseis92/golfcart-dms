"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import ServiceBoardCard from "@/components/ServiceBoardCard";

const COLUMNS = [
  { key: "intake", label: "Intake" },
  { key: "estimate", label: "Estimate" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting_parts", label: "Waiting Parts" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" }
];

export default function ServiceBoardPage() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "workOrders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map(c => [c.key, []]));
    (rows || []).forEach(wo => {
      const k = COLUMNS.some(c => c.key === wo.status) ? wo.status : "intake";
      map[k].push(wo);
    });
    return map;
  }, [rows]);

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Service Board</h1>
        <Link href="/service/new" className="btn">New Work Order</Link>
      </div>

      {!rows ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
          {COLUMNS.map(col => (
            <div key={col.key} className="card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="text-xs text-zinc-500">{grouped[col.key].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].map(wo => (
                  <ServiceBoardCard key={wo.id} wo={wo} />
                ))}
                {grouped[col.key].length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-center text-xs text-zinc-500">No items</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
