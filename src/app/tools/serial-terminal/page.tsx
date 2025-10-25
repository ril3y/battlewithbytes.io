'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal/SerialTerminalClient';

export default function SerialTerminalPage() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Hide header if PWA mode OR user toggled fullscreen
  const hideHeader = isStandalone || isFullscreen;

  return (
    <main className={hideHeader ? 'h-screen' : 'min-h-screen py-16 px-4'}>
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className={hideHeader ? 'h-full flex flex-col' : 'max-w-7xl mx-auto'}>
        {/* Header - show only in browser mode when not fullscreen */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-bold font-mono glow-text">
              <span className="text-green-400">&lt;</span> BattleTerm <span className="text-green-400">/&gt;</span>
            </h1>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded border border-green-500/30 hover:border-green-500/60 transition-colors font-mono text-sm"
              title="Toggle fullscreen terminal view"
            >
              ⛶ Fullscreen
            </button>
          </div>
        )}

        {/* Exit fullscreen button when in fullscreen mode (but not PWA) */}
        {isFullscreen && !isStandalone && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1 bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 rounded border border-gray-600 hover:border-gray-500 transition-colors font-mono text-xs"
              title="Exit fullscreen view"
            >
              ✕ Exit Fullscreen
            </button>
          </div>
        )}

        {/* BattleTerm Component */}
        <SerialTerminal isStandalone={hideHeader} />
      </div>
    </main>
  );
}
