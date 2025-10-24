import { Metadata } from 'next';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@/components/tools/SerialTerminal';

export const metadata: Metadata = {
  title: 'Serial Terminal | Battle With Bytes',
  description: 'Modern web-based serial port terminal with ANSI color support, hex view, macros, and full Unicode support for device communication.',
  keywords: ['serial terminal', 'web serial api', 'serial port', 'terminal emulator', 'serial communication', 'uart', 'usb serial', 'hardware debugging', 'embedded systems'],
  openGraph: {
    title: 'Serial Terminal | Battle With Bytes',
    description: 'Modern web-based serial port terminal with ANSI color support, hex view, macros, and full Unicode support for device communication.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/serial-terminal',
    images: [{
      url: 'https://battlewithbytes.io/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Battle With Bytes - Serial Terminal'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serial Terminal | Battle With Bytes',
    description: 'Modern web-based serial port terminal for device communication',
    images: ['https://battlewithbytes.io/og-image.jpg']
  }
};

export default function SerialTerminalPage() {
  const toolSchema = generateToolSchema(
    'Serial Terminal',
    'Modern web-based serial port terminal with ANSI color support, hex view, macros, and full Unicode support for device communication',
    '/tools/serial-terminal'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 glow-text">
          <span className="text-green-400">&lt;</span> Serial Terminal <span className="text-green-400">/&gt;</span>
        </h1>

        <p className="text-gray-400 mb-8 max-w-3xl">
          A modern, feature-rich serial terminal that runs entirely in your browser. Connect to serial devices,
          view ANSI colors, send commands with macros, and more.
        </p>

        {/* Feature checklist */}
        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Features</h2>
          <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <div className="text-green-400 mb-2">✓ Web Serial API - No drivers needed</div>
              <div className="text-green-400 mb-2">✓ Full ANSI color support</div>
              <div className="text-green-400 mb-2">✓ Multiple view modes (ASCII, Hex, Mixed)</div>
              <div className="text-green-400 mb-2">✓ Custom baud rates up to 921600</div>
              <div className="text-green-400 mb-2">✓ Unicode support (UTF-8)</div>
            </div>
            <div>
              <div className="text-green-400 mb-2">✓ Quick send macros</div>
              <div className="text-green-400 mb-2">✓ Command history</div>
              <div className="text-green-400 mb-2">✓ Save/export logs</div>
              <div className="text-green-400 mb-2">✓ Timestamps & statistics</div>
              <div className="text-green-400 mb-2">✓ Save configuration profiles</div>
            </div>
          </div>
        </div>

        {/* Serial Terminal Component */}
        <div className="mb-8">
          <SerialTerminal />
        </div>

        {/* About section */}
        <div className="bg-black/70 border border-gray-800 rounded-lg p-6 font-mono text-sm">
          <h3 className="text-xl font-bold mb-4 text-green-400">About This Tool</h3>
          <div className="text-gray-300 space-y-4">
            <p>
              The Serial Terminal uses the Web Serial API to communicate directly with serial devices
              from your browser. No drivers, no software installation - just connect and go.
            </p>
            <p>
              Perfect for debugging embedded systems, communicating with microcontrollers (Arduino, ESP32, etc.),
              testing serial protocols, and interacting with any device that speaks UART.
            </p>
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded">
              <div className="font-bold text-yellow-400 mb-2">Browser Support</div>
              <div className="text-yellow-300/90">
                This tool requires the Web Serial API, which is currently supported in Chrome, Edge, and Opera.
                Firefox and Safari do not yet support this feature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
