"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import TechTimer from "@/components/TechTimer";
import { addLaborLine, addPartLine, addPhoto, setStatus, startTimer, stopTimer } from "@/lib/tech";

export default function TechWO() {
  const { id } = useParams();
  const [u, setU] = useState(null);
  const [wo, setWo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [run, setRun] = useState({ running: false, startedAt: null, logId: null });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setU), []);
  useEffect(() => {
    if (!id) return;
    const unsubWO = onSnapshot(
      doc(db, "workOrders", id),
      snap => { setWo(snap.exists() ? { id: snap.id, ...snap.data() } : false); setError(""); },
      err => { setError(err.message || "Failed to load"); setWo(false); }
    );
    const unsubLogs = onSnapshot(
      query(collection(db, "workOrders", id, "timeLogs"), orderBy("startAt", "desc")),
      snap => setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return () => { unsubWO(); unsubLogs(); };
  }, [id]);

  useEffect(() => {
    if (!u) return;
    const live = logs.find(l => l.uid === u.uid && !l.stopAt);
    if (live) {
      const startMs = live.startAt?.toDate?.() ? live.startAt.toDate().getTime() : Date.now();
      setRun({ running: true, startedAt: startMs, logId: live.id });
    } else {
      setRun({ running: false, startedAt: null, logId: null });
    }
  }, [logs, u]);

  async function handleStart() {
    if (!u) return setMsg("Sign in first.");
    const ref = await startTimer(id, u.uid);
    setRun({ running: true, startedAt: Date.now(), logId: ref.id });
  }
  async function handleStop(minutes) {
    if (!run.logId) return;
    await stopTimer(id, run.logId, minutes);
    await addLaborLine(id, { description: `Labor - ${minutes} min`, qty: 1, price: 0 });
    setRun({ running: false, startedAt: null, logId: null });
  }
  async function handleUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsg("Uploading photo…");
    await addPhoto(id, f);
    setMsg("Uploaded.");
    e.target.value = "";
  }
  async function setWOStatus(s) { setMsg("Updating…"); await setStatus(id, s); setMsg(""); }

  async function assignToMe() {
    if (!u) return setMsg("Sign in first.");
    setMsg("Assigning…");
    await updateDoc(doc(db, "workOrders", id), { assignedTechUid: u.uid });
    setMsg("Assigned to you.");
  }

  if (wo === null) return <div className="page text-sm text-zinc-600">Loading…</div>;
  if (wo === false) return <div className="page">Work order not found.</div>;

  const isMine = !!u && wo.assignedTechUid === u.uid;

  return (
    <div className="page space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">WO #{wo.id.slice(-6)} · {wo.customer?.name || "—"}</h1>
          <p className="text-sm text-zinc-600">Status: <span className="capitalize">{wo.status}</span></p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <Link href="/tech/jobs" className="btn">Back</Link>
      </div>

      {!isMine ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          This job isn’t assigned to you.
          <button onClick={assignToMe} className="btn btn-primary ml-3">Assign to me</button>
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Timer</h3>
          <TechTimer running={run.running} startedAt={run.startedAt} onStart={handleStart} onStop={handleStop}/>
          <p className="text-xs text-zinc-500">Stopping auto-adds a labor line.</p>
        </div>

        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Status</h3>
          <div className="flex flex-wrap gap-2">
            {["in_progress","waiting_parts","ready"].map(s=>(
              <button key={s} onClick={()=>setWOStatus(s)} className={"btn "+(wo.status===s?"btn-primary":"")}>
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Tap to update.</p>
        </div>

        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Photos</h3>
          <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="text-sm" />
          <div className="grid grid-cols-4 gap-2">
            {(wo.photos||[]).slice(0,8).map((url,i)=>(
              <a key={i} href={url} target="_blank" className="overflow-hidden rounded border">
                <img src={url} className="h-20 w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Work details */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4 md:col-span-2">
          <h3 className="text-sm font-semibold">Concern</h3>
          <p className="mt-1 text-sm">{wo.concern || "—"}</p>

          <h3 className="mt-4 text-sm font-semibold">Lines ({(wo.lines||[]).length})</h3>
          <div className="mt-2 overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {(wo.lines||[]).map((l,i)=>(
                  <tr key={i} className="border-t">
                    <td className="p-2">{l.type}</td>
                    <td className="p-2">{l.code}</td>
                    <td className="p-2">{l.description}</td>
                    <td className="p-2 text-right">{l.qty}</td>
                    <td className="p-2 text-right">${Number(l.price||0).toFixed(2)}</td>
                  </tr>
                ))}
                {(wo.lines||[]).length===0 && (
                  <tr><td className="p-4 text-center text-xs text-zinc-500" colSpan={5}>No lines</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Quick add</h3>
          <form className="space-y-2" onSubmit={async(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const type = fd.get("type");
            const code = fd.get("code")?.toString()||"";
            const description = fd.get("description")?.toString()||"";
            const qty = Number(fd.get("qty")||1);
            const price = Number(fd.get("price")||0);
            setMsg("Saving...");
            if(type==="part") await addPartLine(id,{code,description,qty,price});
            else await addLaborLine(id,{code:code||"LAB",description,qty,price});
            setMsg("Saved");
            e.currentTarget.reset();
          }}>
            <select name="type" className="input-like">
              <option value="labor">Labor</option>
              <option value="part">Part</option>
            </select>
            <input name="code" placeholder="Code" className="input-like" />
            <input name="description" placeholder="Description" className="input-like" />
            <div className="grid grid-cols-2 gap-2">
              <input name="qty" type="number" step="1" min="1" placeholder="Qty" className="input-like" />
              <input name="price" type="number" step="0.01" placeholder="Price" className="input-like" />
            </div>
            <button className="btn btn-primary w-full">Add line</button>
          </form>
          <p className="text-xs text-zinc-500">{msg}</p>
        </div>
      </div>
    </div>
  );
}
