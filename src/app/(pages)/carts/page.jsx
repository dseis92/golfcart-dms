"use client";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function CartsPage() {
  const [rows, setRows] = useState(null);
  const [qtext, setQtext] = useState("");

  useEffect(() => {
    const q = query(collection(db, "carts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setRows(snap.docs.map(d => d.data())));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = qtext.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(c => {
      const hay = [
        c.id, c.make, c.model, c.location,
        String(c.year || ""), String(c.powerType || ""), String(c.status || "")
      ].join(" ").toLowerCase();
      return hay.includes(t);
    });
  }, [rows, qtext]);

  return (
    <div className="page space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Carts</h1>
        <div className="flex gap-2">
          <input
            className="input-like w-64"
            placeholder="Search carts…"
            value={qtext}
            onChange={e => setQtext(e.target.value)}
          />
          <Link href="/carts/new" className="btn">Add cart</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {!filtered ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No carts match your search.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-zinc-50 p-3 text-left">ID</th>
                <th className="bg-zinc-50 p-3 text-left">Make</th>
                <th className="bg-zinc-50 p-3 text-left">Model</th>
                <th className="bg-zinc-50 p-3 text-left">Year</th>
                <th className="bg-zinc-50 p-3 text-left">Power</th>
                <th className="bg-zinc-50 p-3 text-left">Status</th>
                <th className="bg-zinc-50 p-3 text-left">Location</th>
                <th className="bg-zinc-50 p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3 font-medium">
                    <Link href={`/carts/${c.id}`} className="underline decoration-dotted hover:decoration-solid">
                      {c.id}
                    </Link>
                  </td>
                  <td className="p-3">{c.make ?? "-"}</td>
                  <td className="p-3">{c.model ?? "-"}</td>
                  <td className="p-3">{c.year ?? "-"}</td>
                  <td className="p-3 capitalize">{c.powerType}</td>
                  <td className="p-3 capitalize">{c.status}</td>
                  <td className="p-3">{c.location ?? "-"}</td>
                  <td className="p-3 text-right">
                    <Link href={`/carts/${c.id}`} className="text-zinc-700 underline hover:text-zinc-900">
                      View
                    </Link>
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
