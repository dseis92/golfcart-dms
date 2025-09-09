
"use client";
import Link from "next/link";
import { Plus, List, ScanQrCode, Wrench, Boxes, Users } from "lucide-react";
import FeatureCardExact from "@/components/ui/FeatureCardExact";

function StatCard({ title, sub }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-[12px] font-semibold tracking-wider text-zinc-500 uppercase">{title}</div>
      <div className="mt-3 h-[2px] w-6 rounded bg-zinc-900" />
      <div className="mt-2 text-sm text-zinc-500">{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1220px] px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-white">▦</div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/new" className="inline-flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            <span className="text-lg leading-none">＋</span> Add Cart
          </Link>
          <Link href="/service/new" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100">
            🛠 New Service
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Carts in Stock" sub="Live from Firestore list" />
        <StatCard title="In Service" sub="Active service orders" />
        <StatCard title="Low Parts" sub="Below min stock" />
        <StatCard title="Customers" sub="CRM total" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FeatureCardExact
          icon={List}
          title="Inventory"
          subtitle="Search, filter, and manage carts"
          openHref="/inventory"
          primaryHref="/inventory/new"
          primaryIcon={Plus}
          primaryLabel="Add Cart"
          secondaryHref="/inventory"
          secondaryLabel="Scan / QR Labels"
        />
        <FeatureCardExact
          icon={Wrench}
          title="Service"
          subtitle="Open, in-progress, closed orders"
          openHref="/service"
          primaryHref="/service/new"
          primaryIcon={Plus}
          primaryLabel="New Service Order"
          secondaryHref="/service"
          secondaryLabel="View All"
        />
        <FeatureCardExact
          icon={Boxes}
          title="Parts"
          subtitle="Stock, bins, low inventory"
          openHref="/parts"
          primaryHref="/parts/new"
          primaryIcon={Plus}
          primaryLabel="Add Part"
          secondaryHref="/parts"
          secondaryLabel="View All"
        />
        <FeatureCardExact
          icon={Users}
          title="Customers"
          subtitle="People and organizations"
          openHref="/customers"
          primaryHref="/customers/new"
          primaryIcon={Plus}
          primaryLabel="Add Customer"
          secondaryHref="/customers"
          secondaryLabel="View All"
        />
      </div>
    </div>
  );
}
