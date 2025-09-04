"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { addBay, assignNextToBay, assignNextToFreeBays, enqueueCart, markChargeComplete, markPluggedIn } from "@/lib/charging";
import { PlugZap, CheckCircle2, PlusCircle, ScanLine } from "lucide-react";

function BayCard({ bay, onAssign, onPlugged, onComplete }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{bay.name}</div>
        <span className={["rounded-full px-2 py-0.5 text-xs", bay.currentCartId ? "bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-700"].join(" ")}>
          {bay.currentCartId ? "Assigned" : "Free"}
        </span>
      </div>

      {bay.currentCartId ? (
        <div className="mt-3 text-sm">
          <div className="text-zinc-600">Cart</div>
          <div className="font-medium">{bay.currentCartId}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => onPlugged(bay.id)} className="btn">
              <PlugZap className="h-4 w-4" />
              Plugged In
            </button>
            <button onClick={() => onComplete(bay.id)} className="btn">
              <CheckCircle2 className="h-4 w-4" />
              Charge Complete
            </button>
          </div>
          {bay.pluggedInSince ? (
            <p className="mt-2 text-xs text-zinc-500">Since: {new Date(bay.pluggedInSince).toLocaleString()}</p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">Not confirmed plugged in</p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <button onClick={() => onAssign(bay.id)} className="btn">Assign Next</button>
        </div>
      )}
    </div>
  );
}

function QueueRow({ row }) {
  return (
    <div className="rounded-lg border bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="font-medium">{row.cartId}</div>
        <span className="text-xs text-zinc-500">{row.reason}</span>
      </div>
      <div className="mt-1 text-xs text-zinc-500">Priority: {row.priority} · {new Date(row.requestedAt).toLocaleString()}</div>
    </div>
  );
}

export default function ChargingPage() {
  const [bays, setBays] = useState(null);
  const [queue, setQueue] = useState(null);
  const [cartId, setCartId] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const ub = onSnapshot(collection(db, "chargingBays"), (snap) => {
      setBays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const uq = onSnapshot(query(collection(db, "chargeQueue"), orderBy("priority", "asc"), orderBy("requestedAt", "asc")), (snap) => {
      setQueue(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { ub(); uq(); };
  }, []);

  const freeCount = useMemo(() => (bays || []).filter(b => !b.currentCartId && b.active !== false).length, [bays]);

  async function handleAssignNext(bayId) {
    setMsg("");
    try {
      const cart = await assignNextToBay(bayId);
      setMsg(`Assigned ${cart} to ${bayId}`);
    } catch (e) {
      setMsg(e.message || "Assign failed");
    }
  }

  async function handleAssignAll() {
    setMsg("");
    try {
      const res = await assignNextToFreeBays();
      setMsg(res.length ? `Assigned ${res.length} bay(s)` : "No free bays or queue empty");
    } catch (e) {
      setMsg(e.message || "Assign failed");
    }
  }

  async function handlePlugged(bayId) {
    setMsg("");
    try { await markPluggedIn(bayId); setMsg("Plugged in set"); } catch (e) { setMsg(e.message); }
  }

  async function handleComplete(bayId) {
    setMsg("");
    try { await markChargeComplete(bayId, { autoAssignNext: true }); setMsg("Charge complete"); } catch (e) { setMsg(e.message); }
  }

  async function handleAddBay(e) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name")?.toString().trim();
    if (!name) return;
    setMsg("");
    try { await addBay(name); e.currentTarget.reset(); setMsg("Bay added"); } catch (e) { setMsg(e.message); }
  }

  async function handleQueue(e) {
    e.preventDefault();
    const id = cartId.trim();
    if (!id) return;
    setMsg("");
    try { await enqueueCart(id, "low_soc"); setCartId(""); setMsg(`Queued ${id}`); } catch (e) { setMsg(e.message); }
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Charging</h1>
        <div className="flex gap-2">
          <Link href="/charging/kiosk" className="btn">
            <ScanLine className="h-4 w-4" />
            Kiosk Mode
          </Link>
          <button onClick={handleAssignAll} className="btn">
            Assign Next to {freeCount} Free Bay{freeCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
      <div className="text-xs text-zinc-500">{msg}</div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bays */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Bays</h2>
            <form onSubmit={handleAddBay} className="flex gap-2">
              <input name="name" placeholder="Rack A Plug 1" className="input-like w-56" />
              <button className="btn">
                <PlusCircle className="h-4 w-4" />
                Add Bay
              </button>
            </form>
          </div>
          {!bays ? (
            <div className="text-sm text-zinc-600">Loading…</div>
          ) : bays.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">No bays. Add one.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {bays.map(b => (
                <BayCard
                  key={b.id}
                  bay={b}
                  onAssign={handleAssignNext}
                  onPlugged={handlePlugged}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Queue */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Queue</h2>
          <form onSubmit={handleQueue} className="flex gap-2">
            <input
              value={cartId}
              onChange={e => setCartId(e.target.value)}
              className="input-like w-full"
              placeholder="Scan or enter Cart ID"
            />
            <button className="btn">Queue</button>
          </form>
          {!queue ? (
            <div className="text-sm text-zinc-600">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">Queue is empty.</div>
          ) : (
            <div className="space-y-2">
              {queue.map(q => <QueueRow key={q.id} row={q} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
