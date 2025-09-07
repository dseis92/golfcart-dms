"use client";
import { useState } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import {
  Menu, X, LayoutGrid, ShoppingCart, LogIn,
  Wrench, FilePlus, Boxes, Shield, Users, List,
  BatteryCharging, PlusCircle, WrenchIcon, Calendar
} from "lucide-react";

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
            <Link href="/inventory/new" className="btn hidden sm:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Cart
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

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside
          className={[
            "lg:sticky lg:top-16 lg:h-[calc(100dvh-5rem)] lg:self-start",
            "rounded-xl border bg-white p-3 shadow-sm",
            open ? "" : "hidden lg:block"
          ].join(" ")}
        >
          <nav className="space-y-1">
            <NavLink href="/" icon={LayoutGrid}>Dashboard</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/inventory" icon={List}>Inventory</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/calendar" icon={Calendar}>Calendar</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/charging" icon={BatteryCharging}>Charging</NavLink>
            <NavLink href="/charging/kiosk" icon={BatteryCharging}>Charging · Kiosk</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/carts" icon={ShoppingCart}>Carts</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/service" icon={Wrench}>Service Orders</NavLink>
            <NavLink href="/service/new" icon={FilePlus}>New Service Order</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/tech" icon={WrenchIcon}>Tech Mode</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/parts" icon={Boxes}>Parts</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/customers" icon={Users}>Customers</NavLink>

            <div className="mt-3 mb-1 border-t pt-3" />
            <NavLink href="/admin/roles" icon={Shield}>Admin · Roles</NavLink>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
