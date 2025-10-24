'use client';

/**
 * Client-side wrapper for SerialTerminal
 * Uses dynamic import to prevent SSR issues with xterm.js
 */

import dynamic from 'next/dynamic';

const SerialTerminal = dynamic(() => import('./index'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-black/50 border border-gray-800 rounded-lg">
      <div className="text-center">
        <div className="text-green-400 font-mono text-lg mb-2">Loading Terminal...</div>
        <div className="text-gray-500 text-sm">Initializing xterm.js</div>
      </div>
    </div>
  )
});

export default SerialTerminal;
