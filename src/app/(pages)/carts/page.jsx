"use client";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function CartsPage() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "carts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setRows(snap.docs.map(d => d.data())));
    return () => unsub();
  }, []);

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Carts</h1>
        <Link href="/carts/new" className="btn">Add cart</Link>
      </div>
      <div className="card overflow-x-auto">
        {!rows ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No carts yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 bg-zinc-50 text-left">ID</th>
                <th className="p-3 bg-zinc-50 text-left">Make</th>
                <th className="p-3 bg-zinc-50 text-left">Model</th>
                <th className="p-3 bg-zinc-50 text-left">Year</th>
                <th className="p-3 bg-zinc-50 text-left">Power</th>
                <th className="p-3 bg-zinc-50 text-left">Status</th>
                <th className="p-3 bg-zinc-50 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.id}</td>
                  <td className="p-3">{c.make ?? "-"}</td>
                  <td className="p-3">{c.model ?? "-"}</td>
                  <td className="p-3">{c.year ?? "-"}</td>
                  <td className="p-3 capitalize">{c.powerType}</td>
                  <td className="p-3 capitalize">{c.status}</td>
                  <td className="p-3">{c.location ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
