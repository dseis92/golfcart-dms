import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = { title: "GolfCart DMS" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
