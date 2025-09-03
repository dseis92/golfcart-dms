"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function StatusBadge({ status }) {
  const map = {
    open: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700"
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status] || "bg-zinc-100 text-zinc-700"}`}>
      {String(status || "").replace("_", " ")}
    </span>
  );
}

export default function ServiceOrdersForCart({ cartId }) {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!cartId) return;
    const q = query(collection(db, "serviceOrders"), where("cartId", "==", cartId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data());
        // client-side sort newest first without requiring a Firestore composite index
        list.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));
        setOrders(list);
      },
      (e) => setErr(e.message || "Failed to load service orders")
    );
    return () => unsub();
  }, [cartId]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-800">Service Orders</h2>
        <Link href="/service/new" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
          New Service Order
        </Link>
      </div>

      {err && <div className="px-5 py-3 text-sm text-red-600">{err}</div>}

      {!orders ? (
        <div className="px-5 py-4 text-sm text-zinc-600">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="px-5 py-6 text-sm text-zinc-600">No service orders for this cart yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-left">
              <th className="p-3">Order</th>
              <th className="p-3">Status</th>
              <th className="p-3">Opened</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="p-3">{o.openedAt ? new Date(o.openedAt).toLocaleString() : "-"}</td>
                <td className="p-3 text-right">
                  <Link href={`/service/${o.id}`} className="text-zinc-700 underline hover:text-zinc-900">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
