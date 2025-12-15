import Script from "next/script";
import { generateToolSchema } from "@/utils/seo";
import UCANMonitor from "@/components/UCANMonitor";

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
