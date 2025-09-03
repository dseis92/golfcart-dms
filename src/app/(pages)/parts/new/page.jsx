"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function NewPartPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const skuRaw = fd.get("sku")?.toString().trim() || "";
      const id = skuRaw ? skuRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, "") : `PART-${Date.now()}`;

      const payload = {
        id,
        sku: skuRaw || id,
        name: fd.get("name")?.toString() || "",
        bin: fd.get("bin")?.toString() || "",
        stock: Number(fd.get("stock") || 0),
        reorderLevel: Number(fd.get("reorderLevel") || 0),
        cost: Number(fd.get("cost") || 0),
        price: Number(fd.get("price") || 0),
        vendor: fd.get("vendor")?.toString() || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!payload.name) throw new Error("Name is required");

      await setDoc(doc(db, "parts", id), payload);
      router.push(`/parts/${id}`);
    } catch (e2) {
      setErr(e2.message || "Failed to create part");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <h1 className="text-2xl font-semibold">New Part</h1>
      <div className="card p-6">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">SKU (optional)</label>
            <input name="sku" className="input-like" placeholder="E.g., BAT-48V-LI" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input name="name" className="input-like" placeholder="Lithium battery 48V" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Bin</label>
            <input name="bin" className="input-like" placeholder="A3-07" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Vendor</label>
            <input name="vendor" className="input-like" placeholder="Acme Parts Co." />
          </div>
          <div>
            <label className="mb-1 block text-sm">Stock</label>
            <input name="stock" type="number" className="input-like" defaultValue={0} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Reorder level</label>
            <input name="reorderLevel" type="number" className="input-like" defaultValue={0} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Cost</label>
            <input name="cost" type="number" step="0.01" className="input-like" defaultValue={0} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Price</label>
            <input name="price" type="number" step="0.01" className="input-like" defaultValue={0} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create Part"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
