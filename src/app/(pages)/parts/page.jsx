"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

function LowBadge({ part }) {
  const stock = Number(part?.stock ?? 0);
  const reorder = Number(part?.reorderLevel ?? 0);
  if (Number.isNaN(stock) || Number.isNaN(reorder)) return null;
  if (stock <= reorder) {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Low</span>;
  }
  return null;
}

export default function PartsListPage() {
  const [rows, setRows] = useState(null);
  const [qtext, setQtext] = useState("");

  useEffect(() => {
    const q = query(collection(db, "parts"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => setRows(snap.docs.map((d) => d.data())));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = qtext.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((p) => {
      const hay = [
        p.id, p.sku, p.name, p.bin, p.vendor,
        String(p.stock ?? ""), String(p.reorderLevel ?? "")
      ].join(" ").toLowerCase();
      return hay.includes(t);
    });
  }, [rows, qtext]);

  return (
    <div className="page space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Parts</h1>
        <div className="flex gap-2">
          <input
            className="input-like w-64"
            placeholder="Search parts…"
            value={qtext}
            onChange={(e) => setQtext(e.target.value)}
          />
          <Link href="/parts/new" className="btn">New Part</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {!filtered ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No parts match your search.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="p-3">SKU</th>
                <th className="p-3">Name</th>
                <th className="p-3">Bin</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Reorder</th>
                <th className="p-3">Vendor</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3 font-medium">{p.sku || p.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    {p.name ?? "-"}
                    <LowBadge part={p} />
                  </td>
                  <td className="p-3">{p.bin ?? "-"}</td>
                  <td className="p-3">{p.stock ?? 0}</td>
                  <td className="p-3">{p.reorderLevel ?? 0}</td>
                  <td className="p-3">{p.vendor ?? "-"}</td>
                  <td className="p-3 text-right">
                    <Link href={`/parts/${p.id}`} className="text-zinc-700 underline hover:text-zinc-900">
                      Manage
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
