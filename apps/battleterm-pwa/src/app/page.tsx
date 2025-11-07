'use client';

import { BattleTerm } from '@battlewithbytes/battleterm';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-emerald-500">
        <div className="text-center">
          <div className="text-2xl font-mono mb-2">BattleTerm</div>
          <div className="text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <BattleTerm />
    </main>
  );
}
