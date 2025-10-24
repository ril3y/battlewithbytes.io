'use client';

import { useEffect, useState } from 'react';
import SerialTerminal from './SerialTerminalClient';

/**
 * Client wrapper for SerialTerminal page that detects standalone mode
 * and renders fullscreen when installed as PWA
 */
export default function SerialTerminalPageClient() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone;
    const isAndroidApp = document.referrer.includes('android-app://');

    const standalone = isDisplayStandalone || isIOSStandalone || isAndroidApp;
    setIsStandalone(standalone);

    // Set minimum window size via CSS when in standalone mode
    if (standalone) {
      document.documentElement.style.minWidth = '800px';
      document.documentElement.style.minHeight = '600px';
    }
  }, []);

  if (isStandalone) {
    // Fullscreen mode for PWA - no padding, no title, just terminal
    return (
      <main className="h-screen w-screen overflow-hidden">
        <SerialTerminal />
      </main>
    );
  }

  // Regular browser mode - show title and standard layout
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 glow-text">
          <span className="text-green-400">&lt;</span> BattleTerm <span className="text-green-400">/&gt;</span>
        </h1>
        <SerialTerminal />
      </div>
    </main>
  );
}
