"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";

export default function PartDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [part, setPart] = useState(null);
  const [form, setForm] = useState({
    sku: "", name: "", bin: "", vendor: "",
    stock: 0, reorderLevel: 0, cost: 0, price: 0
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "parts", id), (snap) => {
      if (!snap.exists()) { setPart(false); return; }
      const data = snap.data();
      setPart(data);
      setForm({
        sku: data.sku || id,
        name: data.name || "",
        bin: data.bin || "",
        vendor: data.vendor || "",
        stock: Number(data.stock || 0),
        reorderLevel: Number(data.reorderLevel || 0),
        cost: Number(data.cost || 0),
        price: Number(data.price || 0)
      });
    });
    return () => unsub();
  }, [id]);

  async function saveChanges(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await updateDoc(doc(db, "parts", id), {
        sku: form.sku || id,
        name: form.name || "",
        bin: form.bin || "",
        vendor: form.vendor || "",
        stock: Number(form.stock || 0),
        reorderLevel: Number(form.reorderLevel || 0),
        cost: Number(form.cost || 0),
        price: Number(form.price || 0),
        updatedAt: new Date().toISOString()
      });
    } catch (e2) {
      setErr(e2.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function adjustStock(delta) {
    if (!part) return;
    const next = Math.max(0, Number(part.stock || 0) + delta);
    try {
      await updateDoc(doc(db, "parts", id), {
        stock: next,
        updatedAt: new Date().toISOString()
      });
    } catch (e2) {
      setErr(e2.message || "Failed to adjust stock");
    }
  }

  if (part === null) return <div className="page text-sm text-zinc-500">Loading…</div>;
  if (part === false) {
    return (
      <div className="page space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-zinc-700">Part not found.</p>
          <Link href="/parts" className="btn mt-4 inline-block">Back to Parts</Link>
        </div>
      </div>
    );
  }

  const low = Number(form.stock) <= Number(form.reorderLevel);

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
          <h1 className="mt-2 text-2xl font-semibold">
            {form.name || "(Unnamed Part)"} {low && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Low</span>}
          </h1>
          <p className="text-sm text-zinc-600">SKU: <span className="font-medium text-zinc-900">{form.sku}</span></p>
        </div>
        <Link href="/parts" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">All Parts</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <form onSubmit={saveChanges} className="card p-6 space-y-3 lg:col-span-2">
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">SKU</label>
              <input className="input-like" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <input className="input-like" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Bin</label>
              <input className="input-like" value={form.bin} onChange={(e) => setForm({ ...form, bin: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Vendor</label>
              <input className="input-like" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Stock</label>
              <input type="number" className="input-like" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Reorder level</label>
              <input type="number" className="input-like" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Cost</label>
              <input type="number" step="0.01" className="input-like" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Price</label>
              <input type="number" step="0.01" className="input-like" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="pt-2">
            <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>

        {/* Quick stock actions */}
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-800">Quick Stock</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50" onClick={() => adjustStock(+1)}>+ Add 1</button>
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50" onClick={() => adjustStock(-1)}>- Remove 1</button>
          </div>
          <p className="text-xs text-zinc-500">Stock will never go below 0.</p>
        </div>
      </div>
    </div>
  );
}
