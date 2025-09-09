import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "GolfCart DMS",
  description: "Inventory, service, parts, charging",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b0f19",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
