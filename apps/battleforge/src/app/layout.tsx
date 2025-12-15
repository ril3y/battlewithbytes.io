import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BattleForge - Web-Based Embedded Compiler",
  description: "Browser-based C compiler for embedded systems",
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
