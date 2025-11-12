import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Rental Inventory Management",
  description: "Track rental stock, availability, and bookings with a calendar view",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
