"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewServicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const id = `SO-${Date.now()}`;
      const payload = {
        id,
        cartId: fd.get("cartId")?.toString() || "",
        status: "open",
        notes: fd.get("notes")?.toString() || "",
        techId: null,
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!payload.cartId) throw new Error("Cart ID is required");
      await setDoc(doc(db, "serviceOrders", id), payload);
      router.push(`/service/${id}`);
    } catch (e2) {
      setErr(e2.message || "Failed to create service order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <h1 className="text-2xl font-semibold">New Service Order</h1>
      <div className="card p-6">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm">Cart ID</label>
            <input name="cartId" className="input-like" placeholder="CART-123456" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Notes</label>
            <textarea name="notes" className="input-like min-h-[120px]" placeholder="Describe the issue..." />
          </div>
          <div className="sm:col-span-2">
            <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create Order"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
