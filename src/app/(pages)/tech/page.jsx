"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";

export default function TechHome() {
  const { user, loading } = useAuth();
  const [uid, setUid] = useState(null);

  useEffect(() => { setUid(user?.uid ?? null); }, [user]);

  const q = useMemo(() => {
    if (!uid) return null;
    return query(
      collection(db, "workOrders"),
      where("assignedTechUid", "==", uid),
      orderBy("updatedAt", "desc")
    );
  }, [uid]);

  const { data: jobs = [], loading: jobsLoading } = q ? useFirestoreQuery(q) : { data: [], loading: false };

  if (loading) return <div className="page"><p>Loading…</p></div>;

  if (!user) {
    return (
      <div className="page">
        <div className="card p-6">
          <h1 className="text-xl font-semibold mb-2">Technician Mode</h1>
          <p className="text-sm text-zinc-600 mb-4">Sign in to view your assigned work orders.</p>
          <Link className="btn btn-primary" href="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Technician Mode</h1>
        <Link href="/service/new" className="btn">New Work Order</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <h3 className="font-medium mb-3">My Jobs</h3>
          {jobsLoading ? (
            <p>Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-zinc-500">No assigned jobs.</p>
          ) : (
            <ul className="space-y-2">
              {jobs.map((wo) => (
                <li key={wo.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{wo.id}</p>
                    <p className="text-xs text-zinc-500 capitalize">{wo.status?.replace("_", " ")}</p>
                  </div>
                  <Link href={`/service/${wo.id}`} className="btn">Open</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-medium mb-3">Clock</h3>
          <TechTimer />
        </div>

        <div className="card p-6">
          <h3 className="font-medium mb-3">Quick Actions</h3>
          <div className="grid gap-2">
            <Link href="/inventory" className="btn">Scan / Lookup Cart</Link>
            <Link href="/parts" className="btn">Find Part</Link>
            <Link href="/service" className="btn">Service Board</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <div className="text-3xl font-mono">{hh}:{mm}:{ss}</div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); setElapsed(0); }}>
          Reset
        </button>
      </div>
      <p className="text-xs text-zinc-500">Local timer for quick tracking. Log time on the work order to save.</p>
    </div>
  );
}
