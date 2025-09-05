"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const STATUS = ["intake","estimate","approved","in_progress","waiting_parts","ready","delivered"];

export default function TechJobs() {
  const [u, setU] = useState(null);
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("in_progress");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setU), []);
  useEffect(() => {
    if (!u) return;
    const q = query(collection(db, "workOrders"), where("assignedTechUid", "==", u.uid));
    const unsub = onSnapshot(
      q,
      snap => {
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        rows.sort((a,b)=>(b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setItems(rows);
        setError("");
      },
      err => { setError(err.message || "Failed to load"); setItems([]); }
    );
    return () => unsub();
  }, [u]);

  const rows = useMemo(
    () => (items || []).filter(x => (filter ? x.status === filter : true)),
    [items, filter]
  );

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Jobs</h1>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="input-like w-48">
          <option value="">All statuses</option>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!u ? (
        <div className="rounded-xl border p-6 text-sm">
          You’re not signed in. <Link href="/login" className="underline">Log in</Link>.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : items === null ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-zinc-500">
          Nothing here. Assign a work order to yourself from the Service Board.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-2 text-left">WO</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Concern</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="p-2 font-medium">#{r.id.slice(-6)}</td>
                  <td className="p-2">{r.customer?.name || "—"}</td>
                  <td className="p-2">{r.concern || "—"}</td>
                  <td className="p-2 capitalize">{r.status}</td>
                  <td className="p-2"><Link className="btn" href={`/tech/jobs/${r.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
