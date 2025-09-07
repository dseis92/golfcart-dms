"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { createEvent, tsFromInputLocal, toInputLocal } from "@/lib/calendar";

export default function NewEventPage() {
  const sp = useSearchParams();
  const datePrefill = sp.get("date") ? new Date(sp.get("date")) : new Date();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const defStart = new Date(datePrefill); defStart.setMinutes(0,0,0);
  const defEnd = new Date(defStart.getTime() + 60*60*1000);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title")?.toString() || "";
    const type = fd.get("type")?.toString() || "service";
    const start = tsFromInputLocal(fd.get("start"));
    const end = tsFromInputLocal(fd.get("end"));
    const payload = {
      title, type,
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(end),
      cartId: fd.get("cartId")?.toString() || null,
      customerId: fd.get("customerId")?.toString() || null,
      assignedTechUid: fd.get("assignedTechUid")?.toString() || null,
      notes: fd.get("notes")?.toString() || ""
    };
    try {
      const id = await createEvent(payload);
      router.push(`/calendar/${id}`);
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Failed to create");
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <h1 className="header-title">New Event</h1>
      <form onSubmit={onSubmit} className="card p-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Title</label>
          <input name="title" className="input-like mt-1" placeholder="e.g., Cart #CART-101 oil change" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Type</label>
          <select name="type" className="input-like mt-1">
            <option value="service">Service</option>
            <option value="rental">Rental</option>
            <option value="delivery">Delivery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Assigned Tech (uid)</label>
          <input name="assignedTechUid" className="input-like mt-1" placeholder="optional" />
        </div>

        <div>
          <label className="block text-sm font-medium">Start</label>
          <input type="datetime-local" name="start" className="input-like mt-1" defaultValue={toInputLocal(defStart)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">End</label>
          <input type="datetime-local" name="end" className="input-like mt-1" defaultValue={toInputLocal(defEnd)} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Cart ID</label>
          <input name="cartId" className="input-like mt-1" placeholder="optional CART-..." />
        </div>
        <div>
          <label className="block text-sm font-medium">Customer ID</label>
          <input name="customerId" className="input-like mt-1" placeholder="optional customer doc id" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" className="input-like mt-1" placeholder="Anything important…"></textarea>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="btn btn-primary">{saving ? "Saving…" : "Create"}</button>
          <button type="button" className="btn" onClick={()=>history.back()}>Cancel</button>
        </div>
        {msg ? <p className="text-sm text-red-600 md:col-span-2">{msg}</p> : null}
      </form>
    </div>
  );
}
