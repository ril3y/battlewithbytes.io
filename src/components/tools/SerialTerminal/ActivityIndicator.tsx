/**
 * Activity Indicator Component
 * Virtual TX/RX LEDs showing serial data transmission activity
 */

'use client';

import React, { useEffect, useState } from 'react';

interface ActivityIndicatorProps {
  rxActive: boolean;
  txActive: boolean;
}

export default function ActivityIndicator({ rxActive, txActive }: ActivityIndicatorProps) {
  const [rxBlink, setRxBlink] = useState(false);
  const [txBlink, setTxBlink] = useState(false);

  // RX blink effect
  useEffect(() => {
    if (rxActive) {
      setRxBlink(true);
      const timer = setTimeout(() => setRxBlink(false), 100);
      return () => clearTimeout(timer);
    }
  }, [rxActive]);

  // TX blink effect
  useEffect(() => {
    if (txActive) {
      setTxBlink(true);
      const timer = setTimeout(() => setTxBlink(false), 100);
      return () => clearTimeout(timer);
    }
  }, [txActive]);

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-black/50 border border-gray-800 rounded">
      {/* RX LED */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-75 ${
              rxBlink
                ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]'
                : 'bg-blue-900/40 shadow-[0_0_4px_rgba(96,165,250,0.2)]'
            }`}
          />
          {rxBlink && (
            <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
          )}
        </div>
        <span className="text-xs font-mono text-gray-400">RX</span>
      </div>

      {/* TX LED */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-75 ${
              txBlink
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-amber-900/40 shadow-[0_0_4px_rgba(251,191,36,0.2)]'
            }`}
          />
          {txBlink && (
            <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
          )}
        </div>
        <span className="text-xs font-mono text-gray-400">TX</span>
      </div>
    </div>
  );
}
