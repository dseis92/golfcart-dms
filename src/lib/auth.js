import { auth } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export async function login(email, password) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (err) {
    console.error("[login error]", err.code, err.message);
    throw err; // keep throwing so UI can show message
  }
}
export async function logout() { await signOut(auth); }