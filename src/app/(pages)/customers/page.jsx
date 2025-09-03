"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function CustomersListPage() {
  const [rows, setRows] = useState(null);
  const [qtext, setQtext] = useState("");

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => setRows(snap.docs.map((d) => d.data())));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = qtext.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((c) => {
      const hay = [
        c.id, c.name, c.email, c.phone, c.notes
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(t);
    });
  }, [rows, qtext]);

  return (
    <div className="page space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <input
            className="input-like w-64"
            placeholder="Search customers…"
            value={qtext}
            onChange={(e) => setQtext(e.target.value)}
          />
          <Link href="/customers/new" className="btn">New Customer</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {!filtered ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No customers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3 font-medium">
                    <Link href={`/customers/${c.id}`} className="underline decoration-dotted hover:decoration-solid">
                      {c.name || "(No name)"}
                    </Link>
                  </td>
                  <td className="p-3">{c.email || "-"}</td>
                  <td className="p-3">{c.phone || "-"}</td>
                  <td className="p-3 truncate max-w-[380px]">{c.notes || "-"}</td>
                  <td className="p-3 text-right">
                    <Link href={`/customers/${c.id}`} className="text-zinc-700 underline hover:text-zinc-900">
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
