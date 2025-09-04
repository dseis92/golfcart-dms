"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";

export default function QRLabelPage() {
  const { id } = useParams();
  const [url, setUrl] = useState("");
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const u = `${window.location.origin}/inventory/${id}`;
    setUrl(u);
    QRCode.toCanvas(canvasRef.current, u, { width: 240, margin: 1 }, (err) => {
      if (!err) setDone(true);
    });
  }, [id]);

  function printPage() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-xl p-6 print:max-w-none print:p-0">
      <div className="print:hidden mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">QR Label</h1>
        <div className="flex gap-2">
          <Link href={`/inventory/${id}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Back</Link>
          <button onClick={printPage} className="btn">Print</button>
        </div>
      </div>

      <div className="rounded-xl border p-6 text-center print:border-0">
        <canvas ref={canvasRef} className="mx-auto" />
        <div className="mt-3 text-sm text-zinc-700">{url}</div>
        {!done && <div className="mt-2 text-xs text-zinc-500">Generating…</div>}
      </div>

      <style jsx global>{`
        @media print {
          .btn, a, header, nav { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
