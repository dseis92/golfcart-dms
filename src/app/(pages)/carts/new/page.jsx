"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewCartPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const id = `CART-${Date.now()}`;
    const payload = {
      id,
      make: fd.get("make")?.toString() || null,
      model: fd.get("model")?.toString() || null,
      year: fd.get("year") ? Number(fd.get("year")) : null,
      powerType: fd.get("powerType") === "gas" ? "gas" : "electric",
      status: "in_stock",
      location: fd.get("location")?.toString() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "carts", id), payload);
    router.push("/carts");
  }

  return (
    <div className="page space-y-6">
      <h1 className="text-2xl font-semibold">New cart</h1>
      <div className="card p-6">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Make</label>
            <input name="make" className="input-like" />
          </div>
          <div>
            <label className="block text-sm mb-1">Model</label>
            <input name="model" className="input-like" />
          </div>
          <div>
            <label className="block text-sm mb-1">Year</label>
            <input name="year" type="number" className="input-like" />
          </div>
          <div>
            <label className="block text-sm mb-1">Power type</label>
            <select name="powerType" className="input-like">
              <option value="electric">Electric</option>
              <option value="gas">Gas</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Location</label>
            <input name="location" className="input-like" placeholder="Main Bay A3" />
          </div>
          <div className="sm:col-span-2">
            <button disabled={saving} className="btn">{saving ? "Saving…" : "Save cart"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
