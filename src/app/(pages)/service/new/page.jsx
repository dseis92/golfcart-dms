"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewServiceOrderPage() {
  const [form, setForm] = useState({ concern: "", customerName: "", customerPhone: "" });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await addDoc(collection(db, "workOrders"), {
      status: "intake",
      priority: "normal",
      concern: form.concern,
      diagnosis: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      promisedBy: null,
      customer: {
        name: form.customerName,
        phone: form.customerPhone,
        email: null
      },
      assignedTechUid: null,
      photos: [],
      lines: []
    });
    router.push("/service");
  }

  return (
    <div className="page space-y-6">
      <h1 className="text-2xl font-semibold">New Service Order</h1>
      <form onSubmit={onSubmit} className="grid gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">Customer Name</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="input-like mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Customer Phone</label>
          <input
            type="text"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            className="input-like mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Concern</label>
          <textarea
            value={form.concern}
            onChange={(e) => setForm({ ...form, concern: e.target.value })}
            className="input-like mt-1 min-h-[120px]"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save Work Order"}
        </button>
      </form>
    </div>
  );
}
