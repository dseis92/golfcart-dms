import { BatteryCharging, Truck, Wrench, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, icon: Icon, href }) {
  const body = (
    <div className="card group relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
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

export default function Dashboard() {
  // Placeholder numbers; swap with real Firestore counts later
  const stats = [
    { title: "In Stock", value: 12, icon: Truck, href: "/carts" },
    { title: "In Service", value: 7, icon: Wrench, href: "/carts" },
    { title: "Charging", value: 5, icon: BatteryCharging, href: "/carts" },
    { title: "Alerts", value: 3, icon: AlertTriangle, href: "/carts" },
  ];

  const activity = [
    { title: "CART-104 added to inventory", meta: "2 hours ago", badge: "New", tone: "green" },
    { title: "SO-302 completed", meta: "Yesterday", badge: "Service", tone: "blue" },
    { title: "Battery pack low for CART-067", meta: "3 days ago", badge: "Alert", tone: "red" }
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-600">Overview of inventory and service activity.</p>
        </div>
        <Link href="/carts/new" className="btn self-start sm:self-auto">Add Cart</Link>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} href={s.href} />
        ))}
      </section>

      {/* Recent activity */}
      <section className="card overflow-hidden">
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
              <span className={[
                "text-xs font-medium px-2 py-1 rounded-full",
                a.tone === "green" && "bg-green-100 text-green-700",
                a.tone === "blue" && "bg-blue-100 text-blue-700",
                a.tone === "red" && "bg-red-100 text-red-700"
              ].filter(Boolean).join(" ")}>
                {a.badge}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
