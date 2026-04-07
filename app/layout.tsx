import type { Metadata } from "next";
import "./globals.css";
import { DashboardShell } from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "HavenHatchr",
  description: "Farm-tech dashboard for flocks, chicks, and hatchery operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
