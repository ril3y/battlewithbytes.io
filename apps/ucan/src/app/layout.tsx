import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "uCAN - Universal USB-to-CAN Monitor",
  description:
    "Free browser-based CAN bus packet analyzer for USB-to-CAN hardware. Professional Wireshark-like interface for real-time CAN message capture, filtering, and analysis. Supports Adafruit Feather M4 CAN, Raspberry Pi Pico, and more. No installation required.",
  keywords: [
    "CAN bus analyzer",
    "USB to CAN",
    "CAN packet analyzer",
    "browser CAN tool",
    "uCAN",
    "Feather M4 CAN",
    "Web Serial API",
    "CAN monitoring",
    "real-time CAN",
    "embedded development",
    "automotive CAN",
    "J1939",
    "OBD-II",
  ],
  openGraph: {
    title: "uCAN - Universal USB-to-CAN Monitor",
    description:
      "Professional browser-based CAN bus packet analyzer. Capture, filter, and analyze CAN messages in real-time with Wireshark-like interface.",
    type: "website",
    url: "https://battlewithbytes.io/tools/ucan",
  },
  twitter: {
    card: "summary_large_image",
    title: "uCAN - Universal USB-to-CAN Monitor",
    description:
      "Browser-based CAN bus packet analyzer for USB-to-CAN hardware",
  },
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
