import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOSFET Calculator",
  description: "Interactive MOSFET calculator for N-channel and P-channel configurations. Calculate conduction states, voltages, currents, and power dissipation for electronic circuit design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
