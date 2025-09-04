"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import StatusBadge from "@/components/StatusBadge";
import ServiceOrdersForCart from "@/components/ServiceOrdersForCart";
import PhotoGrid from "@/components/PhotoGrid";

function TabButton({ id, active, onClick, children }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={[
        "rounded-md px-3 py-1.5 text-sm",
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function fmt(iso) {
  try { return iso ? new Date(iso).toLocaleString() : "-"; } catch { return "-"; }
}

export default function InventoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "carts", id), (snap) => {
      if (!snap.exists()) { setCart(false); return; }
      const d = snap.data();
      setCart(d);
      setEdit({
        vin: d.vin || "",
        stockNo: d.stockNo || "",
        make: d.make || "",
        model: d.model || "",
        year: d.year || "",
        powerType: d.powerType || "electric",
        batteryType: d.batteryType || "",
        status: d.status || "available",
        location: d.location || "",
        meterHours: Number(d.meterHours || 0),
        tags: (d.tags || []).join(", "),
        notes: d.notes || "",
        socPercent: d?.batteryPack?.socPercent ?? "",
        lastChargeAt: d?.batteryPack?.lastChargeAt ?? "",
        voltage: d?.batteryPack?.voltage ?? "",
        chemistry: d?.batteryPack?.chemistry ?? "lithium"
      });
    });
    return () => unsub();
  }, [id]);

  const meta = useMemo(() => {
    if (!cart) return [];
    return [
      { k: "VIN", v: cart.vin || "-" },
      { k: "Stock #", v: cart.stockNo || cart.id },
      { k: "Make", v: cart.make || "-" },
      { k: "Model", v: cart.model || "-" },
      { k: "Year", v: cart.year || "-" },
      { k: "Power", v: cart.powerType || "-" },
      { k: "Battery", v: cart.batteryType || "-" },
      { k: "Status", v: <StatusBadge status={cart.status} /> },
      { k: "Location", v: cart.location || "-" },
      { k: "Hours", v: cart.meterHours ?? 0 },
      { k: "Last Seen", v: fmt(cart.lastSeenAt) }
    ];
  }, [cart]);

  async function saveOverview(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const payload = {
        vin: edit.vin || null,
        stockNo: edit.stockNo || null,
        make: edit.make || null,
        model: edit.model || null,
        year: edit.year ? Number(edit.year) : null,
        powerType: edit.powerType || "electric",
        batteryType: edit.batteryType || null,
        status: edit.status || "available",
        location: edit.location || null,
        meterHours: Number(edit.meterHours || 0),
        tags: edit.tags ? edit.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        notes: edit.notes || "",
        updatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, "carts", id), payload);
      setMsg("Saved");
    } catch (e2) {
      setMsg(e2.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveCharging(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await updateDoc(doc(db, "carts", id), {
        "batteryPack.socPercent": edit.socPercent === "" ? null : Number(edit.socPercent),
        "batteryPack.lastChargeAt": edit.lastChargeAt || null,
        "batteryPack.voltage": edit.voltage === "" ? null : Number(edit.voltage),
        "batteryPack.chemistry": edit.chemistry || null,
        updatedAt: new Date().toISOString()
      });
      setMsg("Charging saved");
    } catch (e2) {
      setMsg(e2.message || "Failed to save charging");
    } finally {
      setSaving(false);
    }
  }

  if (cart === null) return <div className="page text-sm text-zinc-500">Loading…</div>;
  if (cart === false) {
    return (
      <div className="page space-y-4">
        <button onClick={() => router.back()} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Back</button>
        <div className="rounded-xl border p-8 text-center">Cart not found.</div>
      </div>
    );
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cart {cart.stockNo || cart.id}</h1>
          <p className="text-sm text-zinc-600">VIN: {cart.vin || "-"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/service/new?cartId=${encodeURIComponent(id)}`} className="btn btn-primary">
            Create Work Order
          </Link>
          <Link href={`/inventory/${id}/qr`} className="btn">QR Label</Link>
          <Link href="/inventory" className="btn">Back to Inventory</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <TabButton id="overview" active={tab === "overview"} onClick={setTab}>Overview</TabButton>
        <TabButton id="service"  active={tab === "service"}  onClick={setTab}>Service</TabButton>
        <TabButton id="charging" active={tab === "charging"} onClick={setTab}>Charging</TabButton>
        <TabButton id="notes"    active={tab === "notes"}    onClick={setTab}>Notes</TabButton>
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={saveOverview} className="card p-6 space-y-3 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["vin", "VIN / Serial"], ["stockNo", "Stock #"],
                ["make", "Make"], ["model", "Model"],
                ["year", "Year"], ["location", "Location"]
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm">{label}</label>
                  <input
                    className="input-like"
                    value={edit[key]}
                    onChange={(e) => setEdit({ ...edit, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm">Power</label>
                <select className="input-like" value={edit.powerType} onChange={(e) => setEdit({ ...edit, powerType: e.target.value })}>
                  <option value="electric">Electric</option>
                  <option value="gas">Gas</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Battery</label>
                <select className="input-like" value={edit.batteryType} onChange={(e) => setEdit({ ...edit, batteryType: e.target.value })}>
                  <option value="">Unknown / N/A</option>
                  <option value="lithium">Lithium</option>
                  <option value="lead-acid">Lead-acid</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Status</label>
                <select className="input-like" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="in_service">In service</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                  <option value="rental">Rental</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Meter Hours</label>
                <input type="number" className="input-like" value={edit.meterHours} onChange={(e) => setEdit({ ...edit, meterHours: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm">Tags (comma-separated)</label>
                <input className="input-like" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />
              </div>
            </div>
            <div className="pt-2">
              <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save Overview"}</button>
              <span className="ml-3 text-xs text-zinc-500">{msg}</span>
            </div>
          </form>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-zinc-800">Quick Facts</h3>
            <dl className="mt-3 space-y-2">
              {meta.map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-sm text-zinc-500">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-3">
            <PhotoGrid photos={(cart.photos || []).map((url, i) => ({ id: String(i), url }))} />
          </div>
        </div>
      )}

      {tab === "service" && (
        <div>
          <ServiceOrdersForCart cartId={cart.id} />
        </div>
      )}

      {tab === "charging" && (
        <form onSubmit={saveCharging} className="card p-6 space-y-3">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm">SOC %</label>
              <input className="input-like" type="number" min={0} max={100}
                value={edit.socPercent} onChange={(e) => setEdit({ ...edit, socPercent: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm">Last Charged At (ISO)</label>
              <input className="input-like" value={edit.lastChargeAt} onChange={(e) => setEdit({ ...edit, lastChargeAt: e.target.value })} />
              <p className="mt-1 text-xs text-zinc-500">Tip: {new Date().toISOString()}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm">Voltage (V)</label>
              <input className="input-like" type="number" value={edit.voltage} onChange={(e) => setEdit({ ...edit, voltage: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm">Chemistry</label>
              <select className="input-like" value={edit.chemistry} onChange={(e) => setEdit({ ...edit, chemistry: e.target.value })}>
                <option value="lithium">Lithium</option>
                <option value="lead_acid">Lead-acid</option>
              </select>
            </div>
          </div>
          <div className="pt-2">
            <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save Charging"}</button>
            <span className="ml-3 text-xs text-zinc-500">{msg}</span>
          </div>
        </form>
      )}

      {tab === "notes" && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-zinc-800">Notes</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm">{cart.notes || "—"}</p>
        </div>
      )}
    </div>
  );
}
