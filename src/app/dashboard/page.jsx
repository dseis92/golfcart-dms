// src/app/dashboard/page.jsx
import Link from "next/link";
import {
  Truck,
  Wrench,
  BatteryCharging,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  CalendarCheck,
  Search
} from "lucide-react";

/** Small stat card used in the grid */
function StatCard({ title, value, icon: Icon, href }) {
  const body = (
    <div className="card group relative overflow-hidden p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/90 p-2 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm text-zinc-600">
        View details
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

/** Badge component for activity list */
function ToneBadge({ tone = "zinc", children }) {
  const tones = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
    zinc: "bg-zinc-100 text-zinc-700"
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tones[tone] || tones.zinc}`}>
      {children}
    </span>
  );
}

export default function Dashboard() {
  // Placeholder stats; wire these to Firestore later
  const stats = [
    { title: "In Stock", value: 12, icon: Truck, href: "/carts" },
    { title: "In Service", value: 7, icon: Wrench, href: "/carts" },
    { title: "Charging", value: 5, icon: BatteryCharging, href: "/carts" },
    { title: "Alerts", value: 3, icon: AlertTriangle, href: "/carts" }
  ];

  const activity = [
    { title: "CART-104 added to inventory", meta: "2 hours ago", badge: "New", tone: "green" },
    { title: "SO-302 completed", meta: "Yesterday", badge: "Service", tone: "blue" },
    { title: "Battery pack low for CART-067", meta: "3 days ago", badge: "Alert", tone: "red" }
  ];

  return (
    <div className="page space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-600">Overview of inventory and service activity.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/carts/new" className="btn">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Cart
          </Link>
          <Link href="/carts" className="rounded-lg px-4 py-2 text-sm border bg-white hover:bg-zinc-50">
            <Search className="mr-2 inline-block h-4 w-4" />
            Browse
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} href={s.href} />
        ))}
      </section>

      {/* Two-column content: activity + quick actions */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <ul className="divide-y">
            {activity.map((a, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-zinc-500">{a.meta}</p>
                </div>
                <ToneBadge tone={a.tone}>{a.badge}</ToneBadge>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-zinc-800">Quick Actions</h3>
            <div className="mt-3 grid gap-2">
              <Link href="/carts/new" className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
                <span className="inline-flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-zinc-500" />
                  New cart
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link href="/carts" className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-zinc-500" />
                  View inventory
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link href="/carts" className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-zinc-500" />
                  Service schedule
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-zinc-800">Tips</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              <li>Use the sidebar to jump between Carts and Add Cart.</li>
              <li>Login keeps your session so you see inventory instantly.</li>
              <li>Wire the stat cards to Firestore when you’re ready.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}