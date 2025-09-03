"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  onSnapshot as onSnapshotCol,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ChevronLeft, UploadCloud } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import ServiceOrdersForCart from "@/components/ServiceOrdersForCart";

function fmtDateTime(iso) {
  try {
    return iso ? new Date(iso).toLocaleString() : "-";
  } catch {
    return "-";
  }
}

function since(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  if (ms < 0) return "just now";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function CartDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Charging form local state
  const [soc, setSoc] = useState("");
  const [lastChargeAt, setLastChargeAt] = useState("");
  const [voltage, setVoltage] = useState("");
  const [chemistry, setChemistry] = useState("lithium"); // 'lithium' | 'lead_acid'
  const [savingCharge, setSavingCharge] = useState(false);
  const isElectric = (cart?.powerType || "").toLowerCase() === "electric";

  // Live cart doc
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "carts", id), (snap) => {
      const data = snap.exists() ? snap.data() : false;
      setCart(data);
      if (data && data.batteryPack) {
        const bp = data.batteryPack;
        setSoc(bp.socPercent ?? "");
        setLastChargeAt(bp.lastChargeAt ?? "");
        setVoltage(bp.voltage ?? "");
        setChemistry(bp.chemistry ?? "lithium");
      }
    });
    return () => unsub();
  }, [id]);

  // Live photos subcollection
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "carts", id, "photos"), orderBy("uploadedAt", "desc"));
    const unsub = onSnapshotCol(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  const meta = useMemo(() => {
    if (!cart || cart === false) return [];
    return [
      { label: "Make", value: cart.make ?? "-" },
      { label: "Model", value: cart.model ?? "-" },
      { label: "Year", value: cart.year ?? "-" },
      { label: "Power", value: cart.powerType },
      { label: "Status", value: cart.status },
      { label: "Location", value: cart.location ?? "-" },
      { label: "Created", value: fmtDateTime(cart.createdAt) },
      { label: "Updated", value: fmtDateTime(cart.updatedAt) }
    ];
  }, [cart]);

  async function onUpload(e) {
    try {
      setError("");
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);

      // Upload to Storage at carts/{id}/{timestamp-filename}
      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const objectRef = ref(storage, `carts/${id}/${safeName}`);
      await uploadBytes(objectRef, file);

      // Get URL, write photo doc
      const url = await getDownloadURL(objectRef);
      const photoId = safeName;
      await setDoc(doc(db, "carts", id, "photos", photoId), {
        id: photoId,
        url,
        uploadedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check Firebase Storage rules and billing plan.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function saveCharging(e) {
    e?.preventDefault?.();
    setSavingCharge(true);
    setError("");
    try {
      const payload = {
        "batteryPack.socPercent": soc === "" ? null : Number(soc),
        "batteryPack.lastChargeAt": lastChargeAt || null,
        "batteryPack.voltage": voltage === "" ? null : Number(voltage),
        "batteryPack.chemistry": chemistry || null,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, "carts", id), payload);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save charging info");
    } finally {
      setSavingCharge(false);
    }
  }

  function setChargedNow() {
    const nowIso = new Date().toISOString();
    setLastChargeAt(nowIso);
  }

  function adjustSoc(delta) {
    const n = Math.max(0, Math.min(100, Number(soc || 0) + delta));
    setSoc(n);
  }

  if (cart === null) {
    return (
      <div className="page">
        <div className="text-sm text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (cart === false) {
    return (
      <div className="page space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-zinc-700">Cart not found.</p>
          <Link href="/carts" className="btn mt-4 inline-block">Back to Carts</Link>
        </div>
      </div>
    );
  }

  const bp = cart.batteryPack || {};
  const lastChargePretty = bp.lastChargeAt ? `${fmtDateTime(bp.lastChargeAt)} (${since(bp.lastChargeAt)})` : "-";

  return (
    <div className="page space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="mt-2 text-2xl font-semibold">Cart {cart.id}</h1>
          <p className="text-sm text-zinc-600">Detailed specs, photos, charging, and service history.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/carts" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">All Carts</Link>
          <Link href="/service/new" className="btn">New Service Order</Link>
        </div>
      </div>

      {/* Info + Photos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-zinc-800">Details</h2>
          <dl className="mt-3 divide-y">
            {meta.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2">
                <dt className="text-sm text-zinc-500">{m.label}</dt>
                <dd className="text-sm font-medium text-zinc-900">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Photos */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Photos</h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
              <UploadCloud className="h-4 w-4 text-zinc-600" />
              <span>{uploading ? "Uploading…" : "Upload"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4">
            <PhotoGrid photos={photos} />
          </div>
        </div>
      </div>

      {/* Charging section (only useful for electric carts, but editable for any) */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800">Charging</h2>
          {isElectric ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Electric</span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">Gas</span>
          )}
        </div>

        {/* Readout */}
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-zinc-500">State of Charge</div>
            <div className="mt-1 text-2xl font-semibold">{bp.socPercent ?? "-"}<span className="text-base font-medium">%</span></div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-zinc-500">Last Charged</div>
            <div className="mt-1 text-sm font-medium">{lastChargePretty}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-zinc-500">Voltage</div>
            <div className="mt-1 text-2xl font-semibold">{bp.voltage ?? "-"}<span className="text-base font-medium">V</span></div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-zinc-500">Chemistry</div>
            <div className="mt-1 text-sm font-medium capitalize">{bp.chemistry ?? "-"}</div>
          </div>
        </div>

        {/* Editor */}
        <form onSubmit={saveCharging} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm">State of Charge (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={100}
                className="input-like"
                value={soc}
                onChange={(e) => setSoc(e.target.value)}
                placeholder="e.g. 80"
              />
              <div className="flex gap-1">
                <button type="button" className="rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50" onClick={() => adjustSoc(-5)}>-5</button>
                <button type="button" className="rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50" onClick={() => adjustSoc(+5)}>+5</button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Last Charged At (ISO or leave blank)</label>
            <div className="flex gap-2">
              <input
                className="input-like"
                value={lastChargeAt}
                onChange={(e) => setLastChargeAt(e.target.value)}
                placeholder={new Date().toISOString()}
              />
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={setChargedNow}
              >
                Now
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Tip: paste ISO like {new Date().toISOString().slice(0, 19)}Z or use “Now”.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm">Battery Voltage (V)</label>
            <input
              type="number"
              className="input-like"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="48"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Chemistry</label>
            <select
              className="input-like"
              value={chemistry}
              onChange={(e) => setChemistry(e.target.value)}
            >
              <option value="lithium">Lithium</option>
              <option value="lead_acid">Lead acid</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button className="btn" disabled={savingCharge}>{savingCharge ? "Saving…" : "Save charging info"}</button>
          </div>
        </form>
      </div>

      {/* Service orders for this cart */}
      <ServiceOrdersForCart cartId={cart.id} />
    </div>
  );
}
