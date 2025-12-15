import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BattleTerm - Browser Serial Terminal",
  description: "Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.",
  manifest: "/manifest.json",
};

export default function SerialTerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
