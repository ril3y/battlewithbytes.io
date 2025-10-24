'use client';

import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal/SerialTerminalClient';

export default function SerialTerminalPage() {
  const toolSchema = generateToolSchema(
    'BattleTerm - Browser Serial Terminal',
    'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.',
    '/tools/serial-terminal'
  );

  return (
    <main className="min-h-screen">
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="h-screen flex flex-col">
        {/* BattleTerm Component - Full screen, no header */}
        <SerialTerminal isStandalone={true} />
      </div>
    </main>
  );
}
