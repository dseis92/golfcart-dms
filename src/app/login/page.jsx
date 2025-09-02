"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); 
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, pw);
      router.push("/carts");
    // replace the catch block in onSubmit
} catch (e) {
  setErr(e.code || "auth/unknown-error");
}
  }

  return (
    <div className="page flex justify-center items-center min-h-[70vh]">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <input className="input-like" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input-like" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="btn w-full">Login</button>
      </form>
    </div>
  );
}
