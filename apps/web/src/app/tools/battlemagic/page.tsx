import { Metadata } from "next";
import Script from "next/script";
import { generateToolSchema } from "@/lib/utils/seo";
import BattleMagicMonitor from "./components/BattleMagicMonitor";
import { WasmProvider } from "./components/WasmProvider";
import { AnalysisProvider } from "./lib/context/AnalysisContext";
import { FirmwareProvider } from "./lib/context/FirmwareContext";

export const metadata: Metadata = {
  title: "BattleMagic - Black Magic Probe Debugger | BattleWithBytes",
  description:
    "Free browser-based debugging interface for Black Magic Probe. Real-time GDB debugging and UART monitoring in a split-panel interface. Professional debugging tool for embedded development. No installation required.",
  keywords: [
    "Black Magic Probe",
    "BMP debugger",
    "GDB interface",
    "UART monitor",
    "embedded debugging",
    "browser debugger",
    "Web Serial API",
    "ARM debugging",
    "SWD debugging",
    "JTAG debugging",
    "embedded development",
    "firmware debugging",
  ],
  openGraph: {
    title: "BattleMagic - Black Magic Probe Debugger",
    description:
      "Professional browser-based debugging interface for Black Magic Probe. Real-time GDB debugging and UART monitoring in a split-panel view.",
    type: "website",
    url: "https://battlewithbytes.io/tools/battlemagic",
  },
  twitter: {
    card: "summary_large_image",
    title: "BattleMagic - Black Magic Probe Debugger",
    description:
      "Browser-based GDB debugging and UART monitoring for Black Magic Probe",
  },
};

export default function BattleMagicPage() {
  const toolSchema = generateToolSchema(
    "BattleMagic - Black Magic Probe Debugger",
    "Professional browser-based debugging interface for Black Magic Probe hardware. Features real-time GDB debugging and UART monitoring in a resizable split-panel layout. Supports SWD and JTAG debugging protocols for ARM Cortex-M microcontrollers. Run GDB commands, view debug output, and monitor UART serial communication simultaneously. No installation required - runs entirely in your browser using the Web Serial API.",
    "/tools/battlemagic",
  );

  return (
    <>
      <Script id="battlemagic-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <WasmProvider>
        <FirmwareProvider>
          <AnalysisProvider>
            <BattleMagicMonitor />
          </AnalysisProvider>
        </FirmwareProvider>
      </WasmProvider>
    </>
  );
}
