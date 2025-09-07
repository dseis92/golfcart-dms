import { db } from "@/lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, where
} from "firebase/firestore";

// CRUD
export function listenEventsBetween(startTs, endTs, cb, errCb) {
  const q = query(
    collection(db, "events"),
    where("start", ">=", startTs),
    where("start", "<", endTs),
    orderBy("start", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, errCb);
}

export async function createEvent(payload) {
  const ref = await addDoc(collection(db, "events"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function getEvent(id) {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateEvent(id, patch) {
  await updateDoc(doc(db, "events", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteEventById(id) {
  await deleteDoc(doc(db, "events", id));
}

// Date utilities
export function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0,0,0,0);
  return d;
}
export function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23,59,59,999);
  return d;
}
export function startOfCalendarGrid(date) {
  const d = startOfMonth(date);
  const day = d.getDay(); // 0 Sun..6 Sat
  d.setDate(d.getDate() - day);
  return d;
}
export function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate()+n); return d;
}
export function isSameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
export function fmtDay(date) {
  return date.toLocaleDateString(undefined,{ month:"short", day:"numeric" });
}
export function tsFromInputLocal(value) {
  // value: "2025-09-05T14:30"
  if (!value) return null;
  const d = new Date(value);
  return d;
}
export function toInputLocal(date) {
  if (!date) return "";
  const pad = (n)=>String(n).padStart(2,"0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
