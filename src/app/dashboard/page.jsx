"use client";
import Link from "next/link";
import { LayoutGrid, List, PlusCircle, Wrench, Boxes, Users, ScanLine } from "lucide-react";

function Stat({ label, value, hint }) {
  return (
    <div className="card h-full">
      <div className="px-4 pt-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      </div>
      <div className="px-4 pb-4 pt-1">
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/new" className="btn btn-primary">
            <PlusCircle className="h-4 w-4" />
            Add Cart
          </Link>
          <Link href="/service/new" className="btn">
            <Wrench className="h-4 w-4" />
            New Service
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Carts in Stock" value="—" hint="Live from Firestore list" />
        <Stat label="In Service" value="—" hint="Active service orders" />
        <Stat label="Low Parts" value="—" hint="Below min stock" />
        <Stat label="Customers" value="—" hint="CRM total" />
      </div>

      {/* Primary sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100">
                <List className="h-4 w-4 text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Inventory</p>
                <p className="text-xs text-zinc-500">Search, filter, and manage carts</p>
              </div>
            </div>
            <Link href="/inventory" className="btn">Open</Link>
          </div>
          <div className="border-t p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/inventory/new" className="btn btn-primary">
                <PlusCircle className="h-4 w-4" />
                Add Cart
              </Link>
              <Link href="/inventory" className="btn">
                <ScanLine className="h-4 w-4" />
                Scan / QR Labels
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100">
                <Wrench className="h-4 w-4 text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Service</p>
                <p className="text-xs text-zinc-500">Open, in-progress, closed orders</p>
              </div>
            </div>
            <Link href="/service" className="btn">Open</Link>
          </div>
          <div className="border-t p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/service/new" className="btn btn-primary">
                <PlusCircle className="h-4 w-4" />
                New Service Order
              </Link>
              <Link href="/service" className="btn">View All</Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100">
                <Boxes className="h-4 w-4 text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Parts</p>
                <p className="text-xs text-zinc-500">Stock, bins, low inventory</p>
              </div>
            </div>
            <Link href="/parts" className="btn">Open</Link>
          </div>
          <div className="border-t p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/parts/new" className="btn btn-primary">Add Part</Link>
              <Link href="/parts" className="btn">View All</Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100">
                <Users className="h-4 w-4 text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Customers</p>
                <p className="text-xs text-zinc-500">People and organizations</p>
              </div>
            </div>
            <Link href="/customers" className="btn">Open</Link>
          </div>
          <div className="border-t p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/customers/new" className="btn btn-primary">
                <PlusCircle className="h-4 w-4" />
                Add Customer
              </Link>
              <Link href="/customers" className="btn">View All</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
