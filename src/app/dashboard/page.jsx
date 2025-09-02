import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="page space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">Quick overview of your carts, services, and parts.</p>
        </div>
        <Link href="/carts/new" className="btn">New Cart</Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-zinc-500">Carts in stock</h3>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">12</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-zinc-500">In service</h3>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">7</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-zinc-500">Low parts</h3>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">3</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Activity</h2>
        </div>
        <ul className="divide-y">
          <li className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-800">Cart #CART-001</p>
              <p className="text-sm text-zinc-500">Added 2 hours ago</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">New</span>
          </li>
          <li className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-800">Service Order #SO-102</p>
              <p className="text-sm text-zinc-500">Completed yesterday</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">Service</span>
          </li>
          <li className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-800">Part #P-550 Low Stock</p>
              <p className="text-sm text-zinc-500">Updated 3 days ago</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Alert</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
