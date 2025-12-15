import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ohm's Law Calculator",
  description:
    "Calculate voltage, current, resistance, and power using Ohm's Law with an interactive visualization and detailed explanations.",
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
