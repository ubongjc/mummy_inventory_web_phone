import type { Metadata } from "next";
import "./styles/globals.css";
import { Providers } from "./components/Providers";

export const metadata: Metadata = {
  title: "Very Simple Inventory",
  description: "Manage your rental business with inventory tracking, bookings, customer management, and premium features",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Very Simple Inventory",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Very Simple Inventory 📦",
    description: "Manage your rental business with inventory tracking, bookings, customer management, and premium features",
    url: "https://verysimpleinventory.com",
    siteName: "Very Simple Inventory",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Very Simple Inventory 📦",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Very Simple Inventory 📦",
    description: "Manage your rental business with inventory tracking, bookings, and customers",
    images: ["/og-image.svg"],
  },
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
