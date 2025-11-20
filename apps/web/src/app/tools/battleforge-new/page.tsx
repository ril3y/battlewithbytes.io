import { Metadata } from 'next';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import { BattleForgeMonitor } from './components/BattleForgeMonitor';
import './battleforge.css';

export const metadata: Metadata = {
  title: 'BattleForge - Web-Based Embedded Compiler | BattleWithBytes',
  description:
    'Free browser-based C compiler for embedded systems. Compile firmware for STM32, ESP32, and other microcontrollers directly in your browser. Real-time compilation with WASM-powered toolchain. No installation required.',
  keywords: [
    'embedded compiler',
    'web compiler',
    'STM32 compiler',
    'ESP32 compiler',
    'WASM compiler',
    'browser IDE',
    'firmware compiler',
    'embedded development',
    'microcontroller IDE',
    'ARM compiler',
    'online compiler',
    'C compiler',
    'embedded C'
  ],
  openGraph: {
    title: 'BattleForge - Web-Based Embedded Compiler',
    description:
      'Professional browser-based C compiler for embedded systems. Compile firmware for STM32, ESP32, and more. Powered by WebAssembly.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/battleforge'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BattleForge - Web-Based Embedded Compiler',
    description: 'Browser-based C compiler for STM32, ESP32, and embedded systems'
  }
};

export default function BattleForgePage() {
  const toolSchema = generateToolSchema(
    'BattleForge - Web-Based Embedded Compiler',
    'Professional browser-based C compiler for embedded systems. Compile firmware for STM32, ESP32, and other microcontrollers directly in your browser using a WASM-powered LLVM/Clang toolchain. Features syntax highlighting, real-time compilation, and support for multiple target architectures. No installation required - runs entirely in your browser.',
    '/tools/battleforge'
  );

  return (
    <>
      <Script id="battleforge-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>
      <BattleForgeMonitor />
    </>
  );
}
