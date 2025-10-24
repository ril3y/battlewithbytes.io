'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal/SerialTerminalClient';

export default function SerialTerminalPage() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if running in PWA/standalone mode
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');

    setIsStandalone(isDisplayStandalone || isIOSStandalone || isAndroidApp);
  }, []);

  const toolSchema = generateToolSchema(
    'BattleTerm - Browser Serial Terminal',
    'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.',
    '/tools/serial-terminal'
  );

  return (
    <main className={isStandalone ? 'min-h-screen' : 'min-h-screen py-16 px-4'}>
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className={isStandalone ? 'h-screen flex flex-col' : 'max-w-7xl mx-auto'}>
        {/* Hide header in PWA mode */}
        {!isStandalone && (
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 glow-text">
            <span className="text-green-400">&lt;</span> BattleTerm <span className="text-green-400">/&gt;</span>
          </h1>
        )}

        {/* BattleTerm Component */}
        <SerialTerminal isStandalone={isStandalone} />
      </div>
    </main>
  );
}
