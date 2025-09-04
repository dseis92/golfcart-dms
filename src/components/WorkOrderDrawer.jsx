"use client";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const STATUSES = ["intake","estimate","approved","in_progress","waiting_parts","ready","delivered"];

export default function WorkOrderDrawer({ workOrderId, onClose }) {
  const [wo, setWo] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const ref = doc(db, "workOrders", workOrderId);
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) { setWo(false); return; }
      const d = { id: snap.id, ...snap.data() };
      setWo(d);
      setEdit({
        status: d.status || "intake",
        priority: d.priority || "normal",
        concern: d.concern || "",
        diagnosis: d.diagnosis || "",
        promisedBy: d.promisedBy || "",
        customer_name: d.customer?.name || "",
        customer_phone: d.customer?.phone || "",
        customer_email: d.customer?.email || "",
        photosText: (d.photos || []).join("\n"),
        lines: Array.isArray(d.lines) ? d.lines.map(x => ({...x})) : []
      });
    });
    return () => unsub();
  }, [workOrderId]);

  const total = useMemo(() => {
    if (!edit?.lines) return 0;
    return edit.lines.reduce((sum, l) => sum + (Number(l.qty || 0) * Number(l.price || 0)), 0);
  }, [edit]);

  async function saveAll(e) {
    e?.preventDefault?.();
    if (!wo || !edit) return;
    setSaving(true); setMsg("");
    try {
      await updateDoc(doc(db, "workOrders", workOrderId), {
        status: edit.status,
        priority: edit.priority,
        concern: edit.concern,
        diagnosis: edit.diagnosis,
        promisedBy: edit.promisedBy || null,
        customer: {
          name: edit.customer_name || "",
          phone: edit.customer_phone || "",
          email: edit.customer_email || ""
        },
        photos: (edit.photosText || "").split("\n").map(s => s.trim()).filter(Boolean),
        lines: edit.lines.map(l => ({
          type: l.type || "labor",
          code: l.code || "",
          description: l.description || "",
          qty: Number(l.qty || 0),
          price: Number(l.price || 0)
        })),
        updatedAt: new Date().toISOString()
      });
      setMsg("Saved");
    } catch (err) {
      setMsg(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function addLine(kind="labor") {
    setEdit(prev => ({...prev, lines: [...(prev.lines||[]), { type: kind, code: "", description: "", qty: 1, price: 0 }]}));
  }
  function removeLine(i) {
    setEdit(prev => ({...prev, lines: prev.lines.filter((_,idx)=>idx!==i)}));
  }
  function updateLine(i, patch) {
    setEdit(prev => {
      const next = [...prev.lines];
      next[i] = {...next[i], ...patch};
      return {...prev, lines: next};
    });
  }

  async function markReady() {
    setSaving(true); setMsg("");
    try {
      await updateDoc(doc(db, "workOrders", workOrderId), {
        status: "ready",
        updatedAt: new Date().toISOString()
      });
      // TODO: integrate SMS provider (e.g., Twilio) here.
      console.log("Notify customer: WO ready");
      setMsg("Marked ready");
    } catch (e) {
      setMsg(e.message || "Failed to mark ready");
    } finally {
      setSaving(false);
    }
  }

  if (wo === null || edit === null) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Work Order #{wo.id?.slice(-6)}</h2>
            <p className="text-xs text-zinc-500">Cart: {wo.cartId || "—"}</p>
          </div>
          <button onClick={onClose} className="btn">Close</button>
        </div>

        <form onSubmit={saveAll} className="mt-6 space-y-6">
          {/* status + priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Status</label>
              <select className="input-like" value={edit.status} onChange={e => setEdit({...edit, status: e.target.value})}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Priority</label>
              <select className="input-like" value={edit.priority} onChange={e => setEdit({...edit, priority: e.target.value})}>
                <option>low</option>
                <option>normal</option>
                <option>high</option>
              </select>
            </div>
          </div>

          {/* customer */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm">Customer name</label>
              <input className="input-like" value={edit.customer_name} onChange={e => setEdit({...edit, customer_name: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Phone</label>
              <input className="input-like" value={edit.customer_phone} onChange={e => setEdit({...edit, customer_phone: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input className="input-like" value={edit.customer_email} onChange={e => setEdit({...edit, customer_email: e.target.value})} />
            </div>
          </div>

          {/* concern / diagnosis */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Concern</label>
              <textarea className="input-like min-h-[100px]" value={edit.concern} onChange={e => setEdit({...edit, concern: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Diagnosis</label>
              <textarea className="input-like min-h-[100px]" value={edit.diagnosis} onChange={e => setEdit({...edit, diagnosis: e.target.value})} />
            </div>
          </div>

          {/* promised by */}
          <div>
            <label className="mb-1 block text-sm">Promised by (ISO or text)</label>
            <input className="input-like" value={edit.promisedBy} onChange={e => setEdit({...edit, promisedBy: e.target.value})} />
            <p className="mt-1 text-xs text-zinc-500">Tip: {new Date(Date.now()+48*3600*1000).toISOString()}</p>
          </div>

          {/* lines */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Lines</h3>
              <div className="flex gap-2">
                <button type="button" className="btn" onClick={() => addLine("labor")}>Add labor</button>
                <button type="button" className="btn" onClick={() => addLine("part")}>Add part</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(edit.lines||[]).map((l,i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <select className="input-like" value={l.type} onChange={e=>updateLine(i,{type:e.target.value})}>
                          <option value="labor">labor</option>
                          <option value="part">part</option>
                        </select>
                      </td>
                      <td className="p-2"><input className="input-like" value={l.code} onChange={e=>updateLine(i,{code:e.target.value})} /></td>
                      <td className="p-2"><input className="input-like" value={l.description} onChange={e=>updateLine(i,{description:e.target.value})} /></td>
                      <td className="p-2 text-right"><input type="number" className="input-like text-right" value={l.qty} onChange={e=>updateLine(i,{qty:Number(e.target.value)})} /></td>
                      <td className="p-2 text-right"><input type="number" className="input-like text-right" value={l.price} onChange={e=>updateLine(i,{price:Number(e.target.value)})} /></td>
                      <td className="p-2 text-right"><button type="button" className="text-sm text-red-600 underline" onClick={()=>removeLine(i)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={4} className="p-2 text-right text-sm">Total</td>
                    <td className="p-2 text-right font-semibold">${total.toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* photos (URLs for now) */}
          <div>
            <label className="mb-1 block text-sm">Photo URLs (one per line)</label>
            <textarea className="input-like min-h-[100px]" value={edit.photosText} onChange={e => setEdit({...edit, photosText: e.target.value})} />
            <p className="mt-1 text-xs text-zinc-500">We can wire direct uploads to Firebase Storage later.</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            <button type="button" className="btn" onClick={markReady} disabled={saving || edit.status==="ready"}>Mark ready</button>
            <span className="text-xs text-zinc-500">{msg}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
