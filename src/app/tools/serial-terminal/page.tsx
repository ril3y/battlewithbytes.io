'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal/SerialTerminalClient';

export default function SerialTerminalPage() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);

  useEffect(() => {
    // Detect if running in PWA/standalone mode
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');

    setIsStandalone(isDisplayStandalone || isIOSStandalone || isAndroidApp);
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setShowExitHint(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Show exit hint briefly when entering fullscreen
  useEffect(() => {
    if (isFullscreen && !isStandalone) {
      setShowExitHint(true);
      const timer = setTimeout(() => setShowExitHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, isStandalone]);

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

        {/* Exit fullscreen hint when in fullscreen mode (but not PWA) */}
        {showExitHint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="px-4 py-2 bg-gray-900/95 text-gray-300 rounded-lg border border-green-500/30 shadow-lg font-mono text-sm">
              Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-green-400">ESC</kbd> to exit fullscreen
            </div>
          </div>
        )}

        {/* BattleTerm Component */}
        <SerialTerminal isStandalone={hideHeader} />
      </div>
    </main>
  );
}
