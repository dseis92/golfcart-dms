"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  getDocs,
  setDoc
} from "firebase/firestore";
import RolePill from "@/components/RolePill";
import { ensureUserDoc } from "@/lib/roles";

const ROLES = ["admin", "sales", "tech"];

export default function AdminRolesPage() {
  const [me, setMe] = useState(null);           // { uid, email }
  const [myRole, setMyRole] = useState("tech"); // my role from Firestore
  const [ready, setReady] = useState(false);

  const [users, setUsers] = useState(null);
  const [qtext, setQtext] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("tech");
  const [msg, setMsg] = useState("");

  // Auth + ensure my user doc exists
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setMe(null); setReady(true); return; }
      const basic = { uid: u.uid, email: u.email || "" };
      setMe(basic);
      try {
        await ensureUserDoc(u.uid, basic.email);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to my users/{uid} to get my role
  useEffect(() => {
    if (!me?.uid) return;
    const unsub = onSnapshot(doc(db, "users", me.uid), (snap) => {
      setMyRole(snap.exists() ? (snap.data().role || "tech") : "tech");
    });
    return () => unsub();
  }, [me?.uid]);

  // Subscribe to all users (admins only)
  useEffect(() => {
    if (myRole !== "admin") return;
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data()));
    });
    return () => unsub && unsub();
  }, [myRole]);

  const filtered = useMemo(() => {
    if (!users) return null;
    const t = qtext.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) =>
      [u.email, u.role, u.id].filter(Boolean).join(" ").toLowerCase().includes(t)
    );
  }, [users, qtext]);

  async function setRoleByEmail(e) {
    e.preventDefault();
    setMsg("");
    const email = formEmail.trim().toLowerCase();
    const role = formRole;
    if (!email) { setMsg("Enter an email"); return; }
    if (!ROLES.includes(role)) { setMsg("Invalid role"); return; }

    // Find user doc by email (user must have signed in at least once)
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) {
      setMsg("No user doc for that email. Ask them to log in once.");
      return;
    }
    const d = snap.docs[0];
    await updateDoc(doc(db, "users", d.id), {
      role,
      updatedAt: new Date().toISOString()
    });
    setMsg(`Updated ${email} → ${role}`);
  }

  async function createUserDocForEmail(e) {
    e.preventDefault();
    setMsg("");
    const email = formEmail.trim().toLowerCase();
    const role = formRole;
    if (!email) { setMsg("Enter an email"); return; }
    if (!ROLES.includes(role)) { setMsg("Invalid role"); return; }
    // This only creates a placeholder; the user still must log in to use the app.
    // Doc id uses email as key to help seed; real user doc should be uid later.
    await setDoc(doc(db, "users", `seed:${email}`), {
      id: `seed:${email}`,
      email,
      role,
      seeded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setMsg(`Seeded doc for ${email}. Replace with real uid after first login.`);
  }

  if (!ready) return <div className="page text-sm text-zinc-500">Loading…</div>;
  if (!me) {
    return (
      <div className="page space-y-4">
        <h1 className="text-2xl font-semibold">Admin · Roles</h1>
        <p className="text-sm text-zinc-600">You must be signed in.</p>
        <Link href="/login" className="btn mt-2 inline-block">Go to Login</Link>
      </div>
    );
  }
  if (myRole !== "admin") {
    return (
      <div className="page space-y-4">
        <h1 className="text-2xl font-semibold">Admin · Roles</h1>
        <p className="text-sm text-zinc-600">Not authorized. Ask an admin to grant access.</p>
        <p className="text-xs text-zinc-500">Signed in as {me.email}</p>
      </div>
    );
  }

  return (
    <div className="page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Roles</h1>
        <Link href="/" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Back</Link>
      </div>

      {/* Assign role by email */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-zinc-800">Set Role by Email</h2>
        <form onSubmit={setRoleByEmail} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            className="input-like"
            placeholder="user@example.com"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <select
            className="input-like sm:w-40"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn sm:w-auto">Set Role</button>
        </form>
        <div className="mt-2 text-xs text-zinc-500">
          The user must have signed in at least once so their Firestore user doc exists.
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Optional seeding: <button className="underline" onClick={createUserDocForEmail}>create placeholder doc</button>
        </div>
        {msg && <p className="mt-3 text-sm text-zinc-700">{msg}</p>}
      </div>

      {/* Users table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-800">Users</h2>
          <input
            className="input-like w-64"
            placeholder="Search users…"
            value={qtext}
            onChange={(e) => setQtext(e.target.value)}
          />
        </div>

        {!filtered ? (
          <div className="p-4 text-sm text-zinc-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">No users.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Doc ID</th>
                <th className="p-3 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function UserRow({ user }) {
  const [role, setRole] = useState(user.role || "tech");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true); setMsg("");
    try {
      await updateDoc(doc(db, "users", user.id), { role, updatedAt: new Date().toISOString() });
      setMsg("Saved");
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span>{user.email || "(no email)"}</span>
          <RolePill role={user.role || "tech"} />
        </div>
      </td>
      <td className="p-3">{user.role || "tech"}</td>
      <td className="p-3">{user.id}</td>
      <td className="p-3 text-right">
        <div className="inline-flex items-center gap-2">
          <select className="input-like" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <span className="text-xs text-zinc-500">{msg}</span>
        </div>
      </td>
    </tr>
  );
}
