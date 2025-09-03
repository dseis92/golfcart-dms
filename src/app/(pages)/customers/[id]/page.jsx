"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "customers", id), (snap) => {
      if (!snap.exists()) { setCustomer(false); return; }
      const data = snap.data();
      setCustomer(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        notes: data.notes || ""
      });
    });
    return () => unsub();
  }, [id]);

  async function saveChanges(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await updateDoc(doc(db, "customers", id), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        updatedAt: new Date().toISOString()
      });
    } catch (e2) {
      setErr(e2.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (customer === null) return <div className="page text-sm text-zinc-500">Loading…</div>;
  if (customer === false) {
    return (
      <div className="page space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-zinc-700">Customer not found.</p>
          <Link href="/customers" className="btn mt-4 inline-block">Back to Customers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="mt-2 text-2xl font-semibold">{form.name || "(No name)"}</h1>
          <p className="text-sm text-zinc-600">Customer ID: <span className="font-medium text-zinc-900">{id}</span></p>
        </div>
        <Link href="/customers" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">All Customers</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <form onSubmit={saveChanges} className="card p-6 space-y-3 lg:col-span-2">
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm">Name</label>
              <input className="input-like" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm">Phone</label>
              <input className="input-like" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm">Email</label>
              <input type="email" className="input-like" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm">Notes</label>
              <textarea className="input-like min-h-[120px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="pt-2">
            <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>

        {/* Quick info */}
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-800">Quick Info</h2>
          <div className="text-sm">
            <div><span className="text-zinc-500">Email:</span> {form.email || "-"}</div>
            <div><span className="text-zinc-500">Phone:</span> {form.phone || "-"}</div>
          </div>
          <p className="text-xs text-zinc-500">
            Future: link this customer to carts, rentals, service orders, and quotes.
          </p>
        </div>
      </div>
    </div>
  );
}
