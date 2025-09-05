import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

/**
 * Create an invoice from a work order (minimal fields).
 * Returns the new invoice ID.
 */
export async function createInvoiceFromWorkOrder(workOrderId) {
  const woRef = doc(db, "workOrders", workOrderId);
  const woSnap = await getDoc(woRef);
  if (!woSnap.exists()) throw new Error("Work order not found");
  const wo = woSnap.data();

  const lines = Array.isArray(wo.lines) ? wo.lines : [];
  const subtotal = lines.reduce((sum, l) => sum + Number(l.price || 0) * Number(l.qty || 1), 0);
  const taxRate = 0.08;
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const docRef = await addDoc(collection(db, "invoices"), {
    workOrderId,
    cartId: wo.cartId || null,
    customer: wo.customer || null,
    status: "draft", // draft -> sent -> signed -> paid
    lines,
    subtotal,
    tax,
    total,
    signatureUrl: null,
    signedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

/** Mark invoice signed (stores signature URL + timestamp). */
export async function markInvoiceSigned(invoiceId, signatureUrl) {
  await updateDoc(doc(db, "invoices", invoiceId), {
    signatureUrl: signatureUrl || null,
    signedAt: serverTimestamp(),
    status: "signed",
    updatedAt: serverTimestamp()
  });
}
