import type { Metadata } from "next";
import "./globals.css";
import "./battlemagic.css";

export const metadata: Metadata = {
  title: "BattleMagic - Black Magic Probe Debugger",
  description:
    "Professional browser-based debugging interface for Black Magic Probe. Real-time GDB debugging and UART monitoring in a split-panel interface. No installation required.",
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
