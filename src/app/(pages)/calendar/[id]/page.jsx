"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { deleteEventById, getEvent, toInputLocal, tsFromInputLocal, updateEvent } from "@/lib/calendar";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ev, setEv] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const e = await getEvent(id);
      if (alive) setEv(e);
    })();
    return () => { alive = false; };
  }, [id]);

  if (ev === null) return <div className="page text-sm text-zinc-600">Loading…</div>;
  if (!ev) return <div className="page">Event not found.</div>;

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateEvent(id, {
        title: fd.get("title")?.toString() || "",
        type: fd.get("type")?.toString() || "service",
        start: Timestamp.fromDate(tsFromInputLocal(fd.get("start"))),
        end: Timestamp.fromDate(tsFromInputLocal(fd.get("end"))),
        assignedTechUid: fd.get("assignedTechUid")?.toString() || null,
        cartId: fd.get("cartId")?.toString() || null,
        customerId: fd.get("customerId")?.toString() || null,
        notes: fd.get("notes")?.toString() || ""
      });
      setMsg("Saved.");
      setSaving(false);
    } catch (err) {
      setMsg(err.message || "Failed to save");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this event?")) return;
    await deleteEventById(id);
    router.push("/calendar");
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="header-title">Edit Event</h1>
        <button onClick={onDelete} className="btn btn-danger">Delete</button>
      </div>

      <form onSubmit={onSubmit} className="card p-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Title</label>
          <input name="title" className="input-like mt-1" defaultValue={ev.title} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Type</label>
          <select name="type" className="input-like mt-1" defaultValue={ev.type || "service"}>
            <option value="service">Service</option>
            <option value="rental">Rental</option>
            <option value="delivery">Delivery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Assigned Tech (uid)</label>
          <input name="assignedTechUid" className="input-like mt-1" defaultValue={ev.assignedTechUid || ""} />
        </div>

        <div>
          <label className="block text-sm font-medium">Start</label>
          <input type="datetime-local" name="start" className="input-like mt-1"
                 defaultValue={toInputLocal(ev.start?.toDate?.() || new Date(ev.start))} required />
        </div>
        <div>
          <label className="block text-sm font-medium">End</label>
          <input type="datetime-local" name="end" className="input-like mt-1"
                 defaultValue={toInputLocal(ev.end?.toDate?.() || new Date(ev.end))} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Cart ID</label>
          <input name="cartId" className="input-like mt-1" defaultValue={ev.cartId || ""} />
        </div>
        <div>
          <label className="block text-sm font-medium">Customer ID</label>
          <input name="customerId" className="input-like mt-1" defaultValue={ev.customerId || ""} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" className="input-like mt-1" defaultValue={ev.notes || ""}></textarea>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="btn btn-primary">{saving ? "Saving…" : "Save"}</button>
          <button type="button" className="btn" onClick={()=>history.back()}>Back</button>
        </div>
        {msg ? <p className="text-sm text-zinc-600 md:col-span-2">{msg}</p> : null}
      </form>
    </div>
  );
}
