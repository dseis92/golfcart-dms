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
  setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ChevronLeft, UploadCloud } from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import ServiceOrdersForCart from "@/components/ServiceOrdersForCart";

export default function CartDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Live cart doc
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "carts", id), (snap) => {
      setCart(snap.exists() ? snap.data() : false);
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
      { label: "Location", value: cart.location ?? "-" }
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
          <p className="text-sm text-zinc-600">Detailed specs, photos, and service history.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/carts" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">All Carts</Link>
          <Link href="/service/new" className="btn">New Service Order</Link>
        </div>
      </div>

      {/* Info + Upload + Service Orders */}
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

      {/* Service orders for this cart */}
      <ServiceOrdersForCart cartId={cart.id} />
    </div>
  );
}
