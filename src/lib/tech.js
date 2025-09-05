import { db, storage } from "@/lib/firebase";
import {
  collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/** Start a work timer entry */
export async function startTimer(workOrderId, uid) {
  const logs = collection(db, "workOrders", workOrderId, "timeLogs");
  return addDoc(logs, {
    uid, startAt: serverTimestamp(), stopAt: null, minutes: 0, type: "labor"
  });
}

/** Stop the active timer by updating a log doc */
export async function stopTimer(workOrderId, logId, minutes) {
  const logRef = doc(db, "workOrders", workOrderId, "timeLogs", logId);
  await updateDoc(logRef, { stopAt: serverTimestamp(), minutes });
  return logRef.id;
}

/** Append a labor line to work order (flat rate or from timer) */
export async function addLaborLine(workOrderId, { code = "LAB", description, qty = 1, price = 0 }) {
  const woRef = doc(db, "workOrders", workOrderId);
  await updateDoc(woRef, {
    lines: arrayUnion({
      type: "labor", code, description, qty, price
    }),
    updatedAt: serverTimestamp()
  });
}

/** Append a parts line */
export async function addPartLine(workOrderId, { code, description, qty = 1, price = 0 }) {
  const woRef = doc(db, "workOrders", workOrderId);
  await updateDoc(woRef, {
    lines: arrayUnion({
      type: "part", code, description, qty, price
    }),
    updatedAt: serverTimestamp()
  });
}

/** Upload a photo to work order and append URL */
export async function addPhoto(workOrderId, file) {
  const path = `workOrders/${workOrderId}/${Date.now()}-${file.name}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  const woRef = doc(db, "workOrders", workOrderId);
  await updateDoc(woRef, { photos: arrayUnion(url), updatedAt: serverTimestamp() });
  return url;
}

/** Quick status change */
export async function setStatus(workOrderId, status) {
  const woRef = doc(db, "workOrders", workOrderId);
  await updateDoc(woRef, { status, updatedAt: serverTimestamp() });
}
