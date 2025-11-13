import type { Metadata } from "next";
import "./styles/globals.css";
import { SessionProvider } from "./components/SessionProvider";

export const metadata: Metadata = {
  title: "Rental Inventory Management - Track Bookings & Inventory",
  description: "Manage your rental business with inventory tracking, bookings, customer management, and premium features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
