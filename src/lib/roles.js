import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Ensures a users/{uid} doc exists with default role "tech" (idempotent). */
export async function ensureUserDoc(uid, email) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: uid,
      email,
      role: "tech",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

/** Fetch role string for current user uid. Returns "tech" if missing. */
export async function fetchUserRole(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().role || "tech") : "tech";
}
