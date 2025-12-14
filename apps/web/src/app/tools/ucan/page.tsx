import { Metadata } from "next";
import Script from "next/script";
import { generateToolSchema } from "@/lib/utils/seo";
import UCANMonitor from "./components/UCANMonitor";

export const metadata: Metadata = {
  title: "uCAN - Universal USB-to-CAN Monitor | BattleWithBytes",
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

export default function UCANPage() {
  const toolSchema = generateToolSchema(
    "uCAN - Universal USB-to-CAN Monitor",
    "Professional browser-based CAN bus packet analyzer for USB-to-CAN hardware. Real-time message capture, filtering, statistics, and export. Wireshark-like interface with support for multiple protocols. Works with Adafruit Feather M4 CAN, Raspberry Pi Pico, and other USB-to-CAN adapters. Features include: live packet capture, CAN ID filtering, hex/binary/ASCII views, message statistics, CSV/JSON export, and firmware flashing. No installation required - runs entirely in your browser using the Web Serial API.",
    "/tools/ucan",
  );

  return (
    <>
      <Script id="ucan-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <UCANMonitor />
    </>
  );
}
