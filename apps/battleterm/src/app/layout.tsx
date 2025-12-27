import { Metadata } from "next";
import "./globals.css";

// Base path for production deployment
const basePath = process.env.NODE_ENV === "production" ? "/tools/battleterm" : "";

export const metadata: Metadata = {
  title: "BattleTerm - Browser Serial Terminal",
  description: "Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.",
};

export default function SerialTerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`${basePath}/battleterm.png`} type="image/png" />
        <link rel="apple-touch-icon" href={`${basePath}/battleterm.png`} />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
