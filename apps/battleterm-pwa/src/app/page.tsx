"use client";

import dynamic from "next/dynamic";

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

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <SerialTerminal isStandalone={true} />
    </div>
  );
}
