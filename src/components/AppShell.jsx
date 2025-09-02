"use client";
import { useState } from "react";
import NavLink from "./NavLink";
import { Menu, X, LayoutGrid, ShoppingCart, PlusCircle, LogIn } from "lucide-react";
import Link from "next/link";

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle menu"
              className="mr-2 rounded-lg p-2 hover:bg-zinc-100 lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">GolfCart DMS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/carts/new" className="btn hidden sm:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Cart
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              <span className="inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Layout row */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside
          className={[
            "lg:sticky lg:top-16 lg:h-[calc(100dvh-5rem)] lg:self-start",
            "rounded-xl border bg-white p-3 shadow-sm",
            open ? "" : "hidden lg:block"
          ].join(" ")}
        >
          <nav className="space-y-1">
            <NavLink href="/" icon={LayoutGrid}>Dashboard</NavLink>
            <NavLink href="/carts" icon={ShoppingCart}>Carts</NavLink>
            <NavLink href="/carts/new" icon={PlusCircle}>Add Cart</NavLink>
            <NavLink href="/login" icon={LogIn}>Login</NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
