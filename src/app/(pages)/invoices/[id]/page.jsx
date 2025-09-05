"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import SignaturePad from "@/components/SignaturePad";
import { markInvoiceSigned } from "@/lib/invoices";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [pad, setPad] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "invoices", id), (snap) => {
      setInv(snap.exists() ? { id: snap.id, ...snap.data() } : false);
    });
    return () => unsub();
  }, [id]);

  async function saveSignature() {
    if (!pad || pad.isEmpty()) { setMsg("Please sign first."); return; }
    setMsg("Uploading signature…");
    const dataUrl = pad.toDataURL("image/png");
    const objectPath = `invoices/${id}/signature.png`;
    const r = ref(storage, objectPath);
    await uploadString(r, dataUrl, "data_url");
    const url = await getDownloadURL(r);
    await markInvoiceSigned(id, url);
    setMsg("Signature saved.");
  }

  if (inv === null) return <div className="page text-sm text-zinc-500">Loading…</div>;
  if (inv === false) return <div className="page">Invoice not found.</div>;

  const lines = inv.lines || [];
  const subtotal = Number(inv.subtotal || 0).toFixed(2);
  const tax = Number(inv.tax || 0).toFixed(2);
  const total = Number(inv.total || 0).toFixed(2);

  const pdfUrl = `/api/invoices/${id}/pdf`;

  return (
    <div className="page space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoice #{inv.id.slice(-6)}</h1>
          <p className="text-sm text-zinc-600">Status: <span className="capitalize">{inv.status}</span></p>
        </div>
        <div className="flex gap-2">
          <a className="btn" href={pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
          <Link className="btn" href="/invoices">Back</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice body */}
        <div className="card p-6 lg:col-span-2">
          <div className="grid gap-1">
            <div className="text-sm font-semibold">{inv.customer?.name || "—"}</div>
            <div className="text-sm text-zinc-600">{inv.customer?.phone || ""} {inv.customer?.email ? " · " + inv.customer.email : ""}</div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{l.type}</td>
                    <td className="p-2">{l.code}</td>
                    <td className="p-2">{l.description}</td>
                    <td className="p-2 text-right">{l.qty}</td>
                    <td className="p-2 text-right">${Number(l.price || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr><td className="p-4 text-center text-xs text-zinc-500" colSpan={5}>No lines</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto grid w-56 gap-1 text-sm">
            <div className="flex justify-between"><span className="text-zinc-600">Subtotal</span><span>${subtotal}</span></div>
            <div className="flex justify-between"><span className="text-zinc-600">Tax</span><span>${tax}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>${total}</span></div>
          </div>
        </div>

        {/* Signature */}
        <div className="card p-6 space-y-3">
          <h3 className="text-sm font-semibold">Customer Sign-Off</h3>
          {inv.signatureUrl ? (
            <div className="space-y-2">
              <img src={inv.signatureUrl} alt="signature" className="h-24 w-full rounded border object-contain bg-white" />
              <p className="text-xs text-zinc-500">Signed {inv.signedAt?.toDate ? inv.signedAt.toDate().toLocaleString() : ""}</p>
            </div>
          ) : (
            <>
              <SignaturePad onReady={setPad} />
              <div className="flex gap-2">
                <button className="btn" onClick={() => pad?.clear()}>Clear</button>
                <button className="btn btn-primary" onClick={saveSignature}>Save Signature</button>
              </div>
              <p className="text-xs text-zinc-500">{msg}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
