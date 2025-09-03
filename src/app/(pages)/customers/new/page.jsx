"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const name = fd.get("name")?.toString().trim() || "";
      if (!name) throw new Error("Name is required");
      const id = `CUS-${Date.now()}`;

      const payload = {
        id,
        name,
        email: fd.get("email")?.toString().trim() || "",
        phone: fd.get("phone")?.toString().trim() || "",
        notes: fd.get("notes")?.toString().trim() || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "customers", id), payload);
      router.push(`/customers/${id}`);
    } catch (e2) {
      setErr(e2.message || "Failed to create customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <h1 className="text-2xl font-semibold">New Customer</h1>
      <div className="card p-6">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm">Name</label>
            <input name="name" className="input-like" placeholder="Customer name" />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm">Phone</label>
            <input name="phone" className="input-like" placeholder="(555) 123-4567" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Email</label>
            <input name="email" type="email" className="input-like" placeholder="name@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Notes</label>
            <textarea name="notes" className="input-like min-h-[120px]" placeholder="Notes about this customer…" />
          </div>
          <div className="sm:col-span-2">
            <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create Customer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
