import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from "firebase/auth";

export function watchAuth(cb) {
  return onAuthStateChanged(auth, (user) => cb(user));
}

export async function login(email, password) {
  if (email && password) {
    await signInWithEmailAndPassword(auth, email, password);
  } else {
    // fallback to anonymous sign-in for quick access/testing
    await signInAnonymously(auth);
  }
}

export async function logout() {
  await signOut(auth);
}
