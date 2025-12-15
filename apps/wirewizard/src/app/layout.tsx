import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wire Mapper | Battle With Bytes",
  description: "Create visual pinout & wiring harness maps for electrical connectors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
