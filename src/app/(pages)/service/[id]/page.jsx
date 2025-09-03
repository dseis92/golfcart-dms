"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot as onSnapshotCol
} from "firebase/firestore";
import { ChevronLeft } from "lucide-react";

const STATUS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" }
];

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

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "serviceOrders", id), (snap) => {
      setOrder(snap.exists() ? snap.data() : false);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "serviceOrders", id, "updates"), orderBy("createdAt", "desc"));
    const unsub = onSnapshotCol(q, (snap) => setUpdates(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [id]);

  async function changeStatus(next) {
    if (!id) return;
    setSaving(true);
    await updateDoc(doc(db, "serviceOrders", id), {
      status: next,
      updatedAt: new Date().toISOString()
    });
    setSaving(false);
  }

  async function addUpdate(e) {
    e.preventDefault();
    if (!note.trim()) return;
    await addDoc(collection(db, "serviceOrders", id, "updates"), {
      note: note.trim(),
      createdAt: new Date().toISOString()
    });
    setNote("");
  }

  if (order === null) {
    return <div className="page text-sm text-zinc-500">Loading…</div>;
  }
  if (order === false) {
    return (
      <div className="page space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-zinc-700">Service order not found.</p>
          <Link href="/service" className="btn mt-4 inline-block">Back to Service</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="mt-2 text-2xl font-semibold">Service Order {order.id}</h1>
          <p className="text-sm text-zinc-600">
            Cart: <span className="font-medium text-zinc-900">{order.cartId}</span>
          </p>
        </div>
        <Link href="/service" className="btn">All Orders</Link>
      </div>

      {/* Status & notes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Status</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid gap-2">
            {STATUS.map((s) => (
              <button
                key={s.value}
                className={`rounded-lg border px-3 py-2 text-sm text-left hover:bg-zinc-50 ${
                  order.status === s.value ? "border-zinc-900" : ""
                }`}
                onClick={() => changeStatus(s.value)}
                disabled={saving}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-500">
            Opened {new Date(order.openedAt).toLocaleString()}
          </div>
        </div>

        <div className="card p-6 space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-800">Updates</h2>
          <form onSubmit={addUpdate} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              className="input-like"
              placeholder="Add a quick update…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn sm:w-auto">Add</button>
          </form>
          {updates.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">
              No updates yet.
            </div>
          ) : (
            <ul className="divide-y">
              {updates.map((u) => (
                <li key={u.id} className="px-3 py-3">
                  <p className="text-sm">{u.note}</p>
                  <p className="text-xs text-zinc-500">{new Date(u.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
