"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setError("");
      },
      (err) => {
        console.error("invoices onSnapshot error:", err);
        setError(err?.message || "Failed to load invoices");
        setInvoices([]); // stop the perpetual "Loading…"
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.includes("permission") ? (
            <span>Permission denied. Make sure you’re signed in and Firestore rules allow reading <code>invoices</code>.</span>
          ) : (
            <span>{error}</span>
          )}
        </div>
      ) : null}

      {invoices === null ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-zinc-500">
          No invoices yet. Create one from a Work Order.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-2 text-left">Invoice</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="p-2">
                    <Link className="underline" href={`/invoices/${inv.id}`}>#{inv.id.slice(-6)}</Link>
                    {inv.workOrderId ? <span className="ml-2 text-xs text-zinc-500">WO {inv.workOrderId.slice(-6)}</span> : null}
                  </td>
                  <td className="p-2">{inv.customer?.name || "—"}</td>
                  <td className="p-2">${Number(inv.total || 0).toFixed(2)}</td>
                  <td className="p-2 capitalize">{inv.status || "draft"}</td>
                  <td className="p-2">
                    {inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
