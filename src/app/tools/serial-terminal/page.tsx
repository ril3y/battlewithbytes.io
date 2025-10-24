import { Metadata } from 'next';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal/SerialTerminalClient';

export const metadata: Metadata = {
  title: 'BattleTerm - Browser Serial Terminal | Battle With Bytes',
  description: 'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. ANSI colors, hex view, macros, command history. No installation required - runs in Chrome, Edge, Opera.',
  keywords: [
    'browser serial terminal',
    'web serial terminal',
    'online serial monitor',
    'serial port browser',
    'web serial api',
    'chrome serial terminal',
    'arduino serial monitor online',
    'esp32 serial terminal',
    'raspberry pi serial console',
    'uart terminal browser',
    'usb serial web',
    'serial communication tool',
    'embedded systems debugging',
    'hardware debugging tool',
    'com port terminal',
    'rs232 terminal',
    'terminal emulator online',
    'serial console web',
    'battleterm',
    'no install serial terminal'
  ],
  openGraph: {
    title: 'BattleTerm - Free Browser-Based Serial Terminal',
    description: 'Professional serial terminal running in your browser. Connect to Arduino, ESP32, Raspberry Pi & more. No software installation needed.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/serial-terminal',
    images: [{
      url: 'https://battlewithbytes.io/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'BattleTerm - Browser Serial Terminal'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BattleTerm - Free Browser Serial Terminal',
    description: 'Professional serial terminal in your browser. No installation. Works with Arduino, ESP32, Raspberry Pi & embedded devices.',
    images: ['https://battlewithbytes.io/og-image.jpg']
  },
  alternates: {
    canonical: 'https://battlewithbytes.io/tools/serial-terminal'
  }
};

export default function SerialTerminalPage() {
  const toolSchema = generateToolSchema(
    'BattleTerm - Browser Serial Terminal',
    'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.',
    '/tools/serial-terminal'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 glow-text">
          <span className="text-green-400">&lt;</span> BattleTerm <span className="text-green-400">/&gt;</span>
        </h1>

        {/* BattleTerm Component */}
        <SerialTerminal />
      </div>
    </main>
  );
}
