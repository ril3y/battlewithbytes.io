"use client";
import React, { useEffect, useState } from 'react';

export default function ContactPage() {
  const [connecting, setConnecting] = useState(true);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!connecting) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    const timeout = setTimeout(() => {
      setConnecting(false);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [connecting]);

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 glow-text">
            <span className="text-green-400">&lt;</span> Contact <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question or want to collaborate? Drop me a message.
          </p>
        </header>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden backdrop-blur mb-8">
          {/* Cyber-themed header visual with CSS patterns */}
          <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-black flex flex-col items-center justify-center overflow-hidden">
            {/* CSS grid pattern */}
            <div className="absolute inset-0"
                 style={{
                   backgroundImage: 'linear-gradient(to right, rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 157, 0.1) 1px, transparent 1px)',
                   backgroundSize: '20px 20px',
                   backgroundPosition: 'center'
                 }}>
            </div>
            {/* Terminal-style welcome message */}
            <div className="z-10 text-center p-8">
              <div className="font-mono text-green-400 text-lg md:text-xl mb-3 glow-text">
                <span className="text-gray-500">&gt;</span> establishing_connection{connecting ? dots : '...'}
              </div>
              {!connecting && (
                <div className="font-mono font-bold text-red-500 text-base mb-2">failed</div>
              )}
              <div className="p-4 border border-green-400/30 bg-black/70 rounded max-w-md mx-auto">
                <p className="font-mono text-sm text-white mb-2">
                  {!connecting ? (
                    <span className="text-red-500 font-bold">CONNECTION FAILED</span>
                  ) : (
                    <span className="text-green-400">CONNECTING</span>
                  )} TO: contact@battlewithbytes.io
                </p>
                {!connecting && (
                  <p className="font-mono text-base text-green-400 mt-4">
                    Contact functionality is <span className="text-yellow-400">not currently available</span>.<br />Please check back soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
