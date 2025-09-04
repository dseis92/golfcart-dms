"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import WorkOrderDrawer from "@/components/WorkOrderDrawer";

export default function WorkOrderPage() {
  const { id } = useParams(); // unified param name
  const [wo, setWo] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "workOrders", id);
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) { setNotFound(true); return; }
      setWo({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  if (notFound) {
    return (
      <div className="page space-y-4">
        <Link href="/service" className="btn">Back to Board</Link>
        <div className="rounded-xl border p-8 text-center">Work order not found.</div>
      </div>
    );
  }

  if (!wo) return <div className="page text-sm text-zinc-500">Loading…</div>;

  return (
    <div className="page space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Work Order #{wo.id?.slice(-6)}</h1>
          <p className="text-sm text-zinc-600">Status: {wo.status || "intake"} · Priority: {wo.priority || "normal"}</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn" href="/service">Back</Link>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>Edit</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-6 space-y-2 lg:col-span-2">
          <h3 className="text-sm font-semibold">Customer</h3>
          <p className="text-sm">{wo.customer?.name || "—"}</p>
          <p className="text-sm text-zinc-600">{wo.customer?.phone || "—"} {wo.customer?.email ? " · " + wo.customer.email : ""}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold">Concern</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{wo.concern || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Diagnosis</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{wo.diagnosis || "—"}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold">Lines</h4>
            <div className="mt-2 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(wo.lines || []).map((l, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{l.type}</td>
                      <td className="p-2">{l.code}</td>
                      <td className="p-2">{l.description}</td>
                      <td className="p-2 text-right">{l.qty}</td>
                      <td className="p-2 text-right">${Number(l.price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(wo.lines || []).length === 0 && (
                    <tr><td className="p-4 text-center text-xs text-zinc-500" colSpan={5}>No lines</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-2">
          <h3 className="text-sm font-semibold">Meta</h3>
          <p className="text-sm">Cart: {wo.cartId || "—"}</p>
          <p className="text-sm">Promised By: {wo.promisedBy ? new Date(wo.promisedBy).toLocaleString() : "—"}</p>
          <p className="text-sm">Created: {wo.createdAt ? new Date(wo.createdAt).toLocaleString() : "—"}</p>
          <p className="text-sm">Updated: {wo.updatedAt ? new Date(wo.updatedAt).toLocaleString() : "—"}</p>

          <div className="mt-2">
            <h4 className="text-sm font-semibold">Photos</h4>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(wo.photos || []).map((url, i) => (
                <a key={i} href={url} target="_blank" className="block overflow-hidden rounded-lg border">
                  <img src={url} alt={`photo ${i}`} className="h-24 w-full object-cover" />
                </a>
              ))}
              {(wo.photos || []).length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-zinc-500 col-span-3">No photos</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {open ? <WorkOrderDrawer workOrderId={wo.id} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
