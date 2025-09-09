"use client";
import NavLink from "@/components/NavLink";
import {
  LayoutDashboard,
  List,
  ShoppingCart,
  Wrench,
  FilePlus,
  Boxes,
  PackagePlus,
  Users,
  UserPlus,
  Shield,
  BatteryCharging,
} from "lucide-react";

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4">
        <nav className="space-y-1">
          <NavLink href="/" icon={LayoutDashboard}>Dashboard</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/inventory" icon={List}>Inventory</NavLink>
          <NavLink href="/charging" icon={BatteryCharging}>Charging</NavLink>
          <NavLink href="/charging/kiosk" icon={BatteryCharging}>Charging · Kiosk</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/carts" icon={ShoppingCart}>Carts</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/service" icon={Wrench}>Service Orders</NavLink>
          <NavLink href="/service/new" icon={FilePlus}>New Service Order</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/parts" icon={Boxes}>Parts</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/customers" icon={Users}>Customers</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/invoices" icon={FilePlus}>Invoices</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/tech" icon={Wrench}>Technician</NavLink>
          <div className="mt-3 mb-1 border-t pt-3" />
          <NavLink href="/admin/roles" icon={Shield}>Admin · Roles</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 bg-zinc-50">{children}</main>
    </div>
  );
}
