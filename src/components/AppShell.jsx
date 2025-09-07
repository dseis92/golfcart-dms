"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Dropdown, Space } from "antd";
import {
  AppstoreOutlined, ShoppingCartOutlined, ThunderboltOutlined, ToolOutlined,
  FileAddOutlined, DeploymentUnitOutlined, TeamOutlined, SafetyOutlined, CalendarOutlined
} from "@ant-design/icons";
import { useAuth } from "@/components/AuthProvider";

const { Header, Sider, Content } = Layout;

const items = [
  { key: "/", icon: <AppstoreOutlined />, label: <Link href="/">Dashboard</Link> },
  { key: "/inventory", icon: <DeploymentUnitOutlined />, label: <Link href="/inventory">Inventory</Link> },
  { key: "/calendar", icon: <CalendarOutlined />, label: <Link href="/calendar">Calendar</Link> },
  { key: "/charging", icon: <ThunderboltOutlined />, label: <Link href="/charging">Charging</Link> },
  { key: "/carts", icon: <ShoppingCartOutlined />, label: <Link href="/carts">Carts</Link> },
  { key: "/service", icon: <ToolOutlined />, label: <Link href="/service">Service Orders</Link> },
  { key: "/service/new", icon: <FileAddOutlined />, label: <Link href="/service/new">New Service Order</Link> },
  { key: "/parts", icon: <DeploymentUnitOutlined />, label: <Link href="/parts">Parts</Link> },
  { key: "/customers", icon: <TeamOutlined />, label: <Link href="/customers">Customers</Link> },
  { key: "/admin/roles", icon: <SafetyOutlined />, label: <Link href="/admin/roles">Admin · Roles</Link> },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth?.() || { user: null, logout: () => {} };

  const selected = items.map(it => it.key)
    .find(k => (k === "/" ? pathname === "/" : pathname.startsWith(k))) || "/";

  const userMenu = {
    items: [
      { key: "profile", label: user ? `Signed in: ${user.email || "Guest"}` : "Not signed in", disabled: true },
      { type: "divider" },
      user ? { key: "logout", label: "Log out", onClick: logout } : { key: "login", label: <Link href="/login">Login</Link> }
    ]
  };

  return (
    <Layout style={{ minHeight: "100dvh" }}>
      <Sider width={240} breakpoint="lg" collapsedWidth={64} theme="light" style={{ borderRight: "1px solid #eef0f4" }}>
        <div className="flex items-center gap-2 px-4 h-14 border-b">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1f3a8a] text-white">GC</div>
          <span className="font-semibold hidden lg:inline">GolfCart DMS</span>
        </div>
        <Menu mode="inline" selectedKeys={[selected]} items={items} style={{ padding: 8 }} />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", borderBottom: "1px solid #eef0f4" }}>
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 gap-3">
            <Space>
              <Link href="/inventory/new">
                <Button type="primary">Add Cart</Button>
              </Link>
            </Space>
            <Dropdown menu={userMenu} trigger={["click"]}>
              <Button>{user ? (user.email || "Guest") : "Login"}</Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: "24px", background: "var(--antd-colorBgLayout, #eef2ff)" }}>
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
