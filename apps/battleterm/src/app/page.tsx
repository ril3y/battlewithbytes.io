"use client";

import dynamic from "next/dynamic";
import Script from "next/script";
import { generateToolSchema } from "@/lib/utils/seo";
import { withBasePath } from "@/lib/utils/basePath";

const SerialTerminal = dynamic(() => import("@battlewithbytes/battleterm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <div className="text-green-400 font-mono text-lg mb-2">
          Loading Terminal...
        </div>
        <div className="text-gray-500 text-sm">Initializing xterm.js</div>
      </div>
    </div>
  ),
});

export default function SerialTerminalPage() {
  const toolSchema = generateToolSchema(
    "BattleTerm - Browser Serial Terminal",
    "Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.",
    "/",
  );

  return (
    <main className="p-4" style={{ height: "100vh" }}>
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      {/* BattleTerm Component - full height minus padding */}
      <div style={{ height: "calc(100vh - 2rem)" }}>
        <SerialTerminal isStandalone={true} logo={withBasePath("/battleterm.png")} />
      </div>
    </main>
  );
}
