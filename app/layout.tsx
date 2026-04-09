import type { Metadata } from "next";
import "./globals.css";
import { DashboardShell } from "@/components/DashboardShell";
import { getAppBaseUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: getAppBaseUrl(),
  title: {
    default: "HavenHatchr",
    template: "%s | HavenHatchr",
  },
  description:
    "Breeder software for flocks, birds, hatch groups, reservations, genetics, and customer tracking.",
  applicationName: "HavenHatchr",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "HavenHatchr",
    title: "HavenHatchr",
    description:
      "Breeder software for flocks, birds, hatch groups, reservations, genetics, and customer tracking.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "HavenHatchr",
    description:
      "Breeder software for flocks, birds, hatch groups, reservations, genetics, and customer tracking.",
  },
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
