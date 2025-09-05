"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function TechHome() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    // Avoid composite-index requirement by skipping orderBy here
    const q = query(collection(db, "workOrders"), where("assignedTechUid", "==", user.uid));
    const unsub = onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort newest first client-side
        list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setJobs(list);
        setError("");
      },
      err => {
        console.error("tech home error:", err);
        setError(err.message || "Failed to load");
        setJobs([]);
      }
    );
    return () => unsub();
  }, [user]);

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tech Mode</h1>
        <Link href="/tech/jobs" className="btn">All My Jobs</Link>
      </div>

      {!user ? (
        <div className="rounded-xl border p-6 text-sm">
          You’re not signed in. <Link href="/login" className="underline">Log in</Link> to see assigned work.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : jobs === null ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-zinc-500">
          No jobs assigned. Go to <Link href="/service" className="underline">Service Board</Link> or open a WO and “Assign to me”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.slice(0, 6).map(wo => (
            <Link key={wo.id} href={`/tech/jobs/${wo.id}`} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">WO #{wo.id.slice(-6)}</div>
                <div className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize">{wo.status}</div>
              </div>
              <div className="mt-2 line-clamp-2 text-sm text-zinc-700">{wo.concern || "—"}</div>
              <div className="mt-2 text-xs text-zinc-500">{wo.customer?.name || "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
