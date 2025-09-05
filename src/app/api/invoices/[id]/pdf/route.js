import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(_req, { params }) {
  try {
    const { id } = params;
    const invSnap = await getDoc(doc(db, "invoices", id));
    if (!invSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const inv = invSnap.data();

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]); // Letter portrait
    const { width } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const draw = (text, x, y, opts={}) => {
      page.drawText(String(text ?? ""), {
        x, y,
        size: opts.size || 12,
        font: opts.bold ? fontBold : font,
        color: rgb(0.1,0.1,0.1)
      });
    };

    // Header
    draw("GolfCart DMS", 40, 752, { size: 18, bold: true });
    draw(`Invoice #${String(id).slice(-6)}`, 40, 730, { size: 12 });
    draw(new Date().toLocaleString(), width - 200, 730, { size: 10 });

    // Customer
    const custY = 700;
    draw("Bill To", 40, custY, { bold: true });
    draw(inv.customer?.name || "-", 40, custY-16);
    draw(inv.customer?.phone || "-", 40, custY-32);
    if (inv.customer?.email) draw(inv.customer.email, 40, custY-48);

    // Lines table
    let y = 630;
    draw("Type", 40, y, { bold: true });
    draw("Code", 100, y, { bold: true });
    draw("Description", 180, y, { bold: true });
    draw("Qty", 430, y, { bold: true });
    draw("Price", 480, y, { bold: true });
    y -= 14;

    (inv.lines || []).forEach((l) => {
      draw(l.type || "-", 40, y);
      draw(l.code || "-", 100, y);
      draw(l.description || "-", 180, y);
      draw(String(l.qty || 1), 430, y);
      draw(`$${Number(l.price || 0).toFixed(2)}`, 480, y);
      y -= 14;
      if (y < 120) { y = 700; pdf.addPage([612,792]); }
    });

    // Totals
    const totalsY = Math.max(y - 20, 140);
    draw("Subtotal:", 420, totalsY);
    draw(`$${Number(inv.subtotal||0).toFixed(2)}`, 500, totalsY);
    draw("Tax:", 420, totalsY-16);
    draw(`$${Number(inv.tax||0).toFixed(2)}`, 500, totalsY-16);
    draw("Total:", 420, totalsY-32, { bold: true });
    draw(`$${Number(inv.total||0).toFixed(2)}`, 500, totalsY-32, { bold: true });

    // Signature
    draw("Customer Signature:", 40, 120, { bold: true });
    if (inv.signatureUrl) {
      const pngBytes = await fetch(inv.signatureUrl).then(r => r.arrayBuffer());
      const pngImage = await pdf.embedPng(pngBytes);
      const sigW = 240, sigH = (pngImage.height/pngImage.width)*sigW;
      page.drawImage(pngImage, { x: 40, y: 120 - sigH - 6, width: sigW, height: sigH });
      draw(`Signed: ${inv.signedAt?.toDate ? inv.signedAt.toDate().toLocaleString() : ""}`, 40, 88);
    } else {
      draw("(not signed)", 40, 100);
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename=invoice-${String(id).slice(-6)}.pdf`
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
