"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import Link from "next/link";

export default function NewInventoryCartPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);

      const id = `CART-${Date.now()}`;
      const vin = fd.get("vin")?.toString().trim() || "";
      const stockNo = fd.get("stockNo")?.toString().trim() || "";
      const make = fd.get("make")?.toString().trim() || "";
      const model = fd.get("model")?.toString().trim() || "";
      const year = Number(fd.get("year") || 0) || null;
      const powerType = fd.get("powerType")?.toString() || "electric";
      const batteryType = fd.get("batteryType")?.toString() || "";
      const status = fd.get("status")?.toString() || "available";
      const location = fd.get("location")?.toString().trim() || "";
      const meterHours = Number(fd.get("meterHours") || 0) || 0;
      const tags = fd.get("tags")?.toString().split(",").map(t => t.trim()).filter(Boolean) || [];
      const notes = fd.get("notes")?.toString().trim() || "";

      const payload = {
        id,
        vin: vin || null,
        stockNo: stockNo || null,
        make: make || null,
        model: model || null,
        year,
        powerType,
        batteryType: batteryType || null,
        status,
        location: location || null,
        meterHours,
        lastSeenAt: new Date().toISOString(),
        tags,
        photos: [],
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const batch = writeBatch(db);
      batch.set(doc(db, "carts", id), payload);
      if (vin) {
        batch.set(doc(db, "serials", vin), { serial: vin, cartId: id, createdAt: new Date().toISOString() });
      }
      await batch.commit();

      router.push(`/inventory/${id}`);
    } catch (e2) {
      setErr(e2.message || "Failed to create cart");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Cart</h1>
        <Link href="/inventory" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Inventory</Link>
      </div>

      <div className="card p-6">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">VIN / Serial</label>
            <input name="vin" className="input-like" placeholder="e.g., 5E2..." />
          </div>
          <div>
            <label className="mb-1 block text-sm">Stock #</label>
            <input name="stockNo" className="input-like" placeholder="GC-1024" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Make</label>
            <input name="make" className="input-like" placeholder="Club Car" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Model</label>
            <input name="model" className="input-like" placeholder="Tempo" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Year</label>
            <input name="year" type="number" className="input-like" placeholder="2023" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Power Type</label>
            <select name="powerType" className="input-like">
              <option value="electric">Electric</option>
              <option value="gas">Gas</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Battery Type</label>
            <select name="batteryType" className="input-like">
              <option value="">Unknown / N/A</option>
              <option value="lithium">Lithium</option>
              <option value="lead-acid">Lead-acid</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Status</label>
            <select name="status" className="input-like">
              <option value="available">Available</option>
              <option value="in_service">In service</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
              <option value="rental">Rental</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Location</label>
            <input name="location" className="input-like" placeholder="Lot A" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Meter Hours</label>
            <input name="meterHours" type="number" className="input-like" defaultValue={0} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Tags (comma-separated)</label>
            <input name="tags" className="input-like" placeholder="lifted, street legal" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm">Notes</label>
            <textarea name="notes" className="input-like min-h-[120px]" placeholder="Anything to remember…" />
          </div>

          <div className="sm:col-span-2">
            <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create Cart"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
