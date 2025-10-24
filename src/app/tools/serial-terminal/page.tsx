import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminalPageClient from '@/components/tools/SerialTerminal/SerialTerminalPageClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

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
  },
  manifest: '/battleterm-manifest.json'
};

export default function SerialTerminalPage() {
  const toolSchema = generateToolSchema(
    'BattleTerm - Browser Serial Terminal',
    'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.',
    '/tools/serial-terminal'
  );

  return (
    <>
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>
      <SerialTerminalPageClient />
    </>
  );
}
