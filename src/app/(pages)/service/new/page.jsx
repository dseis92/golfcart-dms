"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const presetCartId = sp.get("cartId") || "";
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const id = `WO-${Date.now()}`;
      const payload = {
        id,
        cartId: fd.get("cartId")?.toString().trim() || null,
        status: "intake",
        priority: fd.get("priority")?.toString() || "normal",
        concern: fd.get("concern")?.toString() || "",
        diagnosis: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        promisedBy: null,
        customer: {
          name: fd.get("customer_name")?.toString() || "",
          phone: fd.get("customer_phone")?.toString() || "",
          email: fd.get("customer_email")?.toString() || ""
        },
        assignedTechUid: null,
        photos: [],
        lines: []
      };
      await setDoc(doc(db, "workOrders", id), payload);
      router.push("/service");
    } catch (e2) {
      setErr(e2.message || "Failed to create work order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Work Order</h1>
        <Link href="/service" className="btn">Back to Board</Link>
      </div>

      <div className="card p-6">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Cart ID (optional)</label>
            <input name="cartId" defaultValue={presetCartId} className="input-like" placeholder="e.g., CART-..." />
            <p className="mt-1 text-xs text-zinc-500">Tip: open a cart and append “/service/new?cartId=ID”.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm">Customer name</label>
            <input name="customer_name" className="input-like" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Phone</label>
            <input name="customer_phone" className="input-like" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input name="customer_email" className="input-like" />
          </div>

          <div>
            <label className="mb-1 block text-sm">Priority</label>
            <select name="priority" className="input-like">
              <option>normal</option>
              <option>high</option>
              <option>low</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Concern</label>
            <textarea name="concern" className="input-like min-h-[120px]" placeholder="Describe the issue…" />
          </div>

          <div className="sm:col-span-2">
            <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create WO"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
