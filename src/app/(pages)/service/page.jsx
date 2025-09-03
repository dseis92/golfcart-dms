"use client";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

function StatusBadge({ status }) {
  const map = {
    open: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700"
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status] || "bg-zinc-100 text-zinc-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function ServiceListPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "serviceOrders"), orderBy("openedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => d.data())));
    return () => unsub();
  }, []);

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Service Orders</h1>
        <Link href="/service/new" className="btn">New Service Order</Link>
      </div>

      <div className="card overflow-x-auto">
        {!orders ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No service orders yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Cart</th>
                <th className="p-3">Status</th>
                <th className="p-3">Opened</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-medium">{o.id}</td>
                  <td className="p-3">{o.cartId}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3">{new Date(o.openedAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <Link href={`/service/${o.id}`} className="text-zinc-700 underline hover:text-zinc-900">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
