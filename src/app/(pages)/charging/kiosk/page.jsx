"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { assignNextToBay, enqueueCart, markChargeComplete, markPluggedIn } from "@/lib/charging";

export default function ChargingKiosk() {
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

  async function queueCart(e) {
    e.preventDefault();
    const id = cartId.trim();
    if (!id) return;
    setMsg("");
    try { await enqueueCart(id, "low_soc"); setCartId(""); setMsg(`Queued ${id}`); } catch (e) { setMsg(e.message); }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-900 text-white p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left: Assigned now */}
        <div>
          <h1 className="text-xl font-semibold">Assigned Now</h1>
          {!bays ? (
            <div className="mt-4 text-sm text-zinc-300">Loading…</div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {bays.filter(b => b.currentCartId).map(b => (
                <div key={b.id} className="rounded-xl bg-zinc-800 p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-300">{b.name}</div>
                    <span className="rounded-full bg-amber-200/20 px-2 py-0.5 text-xs text-amber-200">Assigned</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{b.currentCartId}</div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button onClick={() => markPluggedIn(b.id)} className="rounded-lg bg-white px-3 py-3 text-sm text-zinc-900 hover:bg-zinc-100">
                      Plugged In
                    </button>
                    <button onClick={() => markChargeComplete(b.id, { autoAssignNext: true })} className="rounded-lg bg-emerald-500 px-3 py-3 text-sm text-white hover:bg-emerald-600">
                      Charge Complete
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    {b.pluggedInSince ? `Since ${new Date(b.pluggedInSince).toLocaleString()}` : "Not confirmed plugged in"}
                  </div>
                </div>
              ))}

              {/* Show free bays with assign button */}
              {bays.filter(b => !b.currentCartId).map(b => (
                <div key={b.id} className="rounded-xl bg-zinc-800 p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-300">{b.name}</div>
                    <span className="rounded-full bg-emerald-200/20 px-2 py-0.5 text-xs text-emerald-200">Free</span>
                  </div>
                  <button onClick={() => assignNextToBay(b.id)} className="mt-4 w-full rounded-lg bg-white px-3 py-3 text-sm text-zinc-900 hover:bg-zinc-100">
                    Assign Next
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Queue + scanner */}
        <div>
          <h2 className="text-lg font-semibold">Queue</h2>
          <form onSubmit={queueCart} className="mt-3 flex gap-2">
            <input
              value={cartId}
              onChange={e => setCartId(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              placeholder="Scan or enter Cart ID"
            />
            <button className="rounded-lg bg-white px-4 text-sm text-zinc-900 hover:bg-zinc-100">Queue</button>
          </form>
          <div className="mt-2 text-xs text-zinc-300">{msg}</div>

          {!queue ? (
            <div className="mt-4 text-sm text-zinc-300">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-300">Queue is empty.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {queue.map(q => (
                <div key={q.id} className="rounded-xl bg-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{q.cartId}</div>
                    <div className="text-xs text-zinc-400">{q.reason}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">Priority {q.priority} · {new Date(q.requestedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
