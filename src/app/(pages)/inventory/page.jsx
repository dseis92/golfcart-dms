"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import StatusBadge from "@/components/StatusBadge";

export default function InventoryListPage() {
  const [rows, setRows] = useState(null);
  const [qtext, setQtext] = useState("");
  const [status, setStatus] = useState("");
  const [power, setPower] = useState("");

  useEffect(() => {
    const q = query(collection(db, "carts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setRows(snap.docs.map((d) => d.data())));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = qtext.trim().toLowerCase();
    return rows.filter((c) => {
      const hay = [
        c.id, c.vin, c.stockNo, c.make, c.model, c.location,
        String(c.year || ""), String(c.meterHours || ""), (c.tags || []).join(" ")
      ].join(" ").toLowerCase();
      const matchText = t ? hay.includes(t) : true;
      const matchStatus = status ? (c.status === status) : true;
      const matchPower = power ? (c.powerType === power) : true;
      return matchText && matchStatus && matchPower;
    });
  }, [rows, qtext, status, power]);

  return (
    <div className="page space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <div className="flex gap-2">
          <input
            className="input-like w-64"
            placeholder="Search VIN, stock#, make, model, tag…"
            value={qtext}
            onChange={(e) => setQtext(e.target.value)}
          />
          <select className="input-like" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="in_service">In service</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="rental">Rental</option>
          </select>
          <select className="input-like" value={power} onChange={(e) => setPower(e.target.value)}>
            <option value="">All power</option>
            <option value="electric">Electric</option>
            <option value="gas">Gas</option>
          </select>
          <Link href="/inventory/new" className="btn">Add Cart</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {!filtered ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No carts match your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="p-3">Stock #</th>
                <th className="p-3">VIN</th>
                <th className="p-3">Make/Model</th>
                <th className="p-3">Year</th>
                <th className="p-3">Power</th>
                <th className="p-3">Status</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3 font-medium">{c.stockNo || c.id}</td>
                  <td className="p-3">{c.vin || "-"}</td>
                  <td className="p-3">
                    <div className="font-medium">{[c.make, c.model].filter(Boolean).join(" ") || "-"}</div>
                    <div className="mt-0.5 text-xs text-zinc-500 truncate max-w-[260px]">
                      {(c.tags || []).join(", ")}
                    </div>
                  </td>
                  <td className="p-3">{c.year || "-"}</td>
                  <td className="p-3 capitalize">{c.powerType || "-"}</td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                  <td className="p-3">{c.location || "-"}</td>
                  <td className="p-3 text-right">
                    <Link href={`/inventory/${c.id}`} className="text-zinc-700 underline hover:text-zinc-900">
                      Open
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
