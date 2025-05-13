import { generateToolSchema } from '@/lib/utils/seo';
import Script from 'next/script';
import { WireMapper } from './components/WireMapper';

// Enhanced SEO metadata
export const metadata = {
  title: 'Wire Mapper | Battle With Bytes',
  description: 'Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical connectors with an interactive tool.',
  keywords: ['wire mapper', 'pinout visualizer', 'connector mapping', 'wiring harness', 'electrical engineering', 'connector diagram', 'wiring diagram'],
  openGraph: {
    title: 'Wire Mapper | Battle With Bytes',
    description: 'Create visual pinout & wiring harness maps for electrical connectors.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/wiremapper',
    images: [
      {
        url: '/images/og/wire-mapper.png',
        width: 1200,
        height: 630,
        alt: 'Wire Mapper Tool',
      },
    ],
  },
};

export default function WireMapperPage() {
  // Tool schema for structured data
  const toolSchema = generateToolSchema(
    'Wire Mapper',
    'Create visual pinout & wiring harness maps for electrical connectors. Define, preview, and map electrical connectors with an interactive tool.',
    '/tools/wiremapper'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      {/* Structured data for search engines */}
      <Script id="wiremapper-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Wire Mapper <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Create visual pinout & wiring harness maps for electrical connectors. 
          Define connector layouts, assign pin names, and map connections with this interactive tool.
        </p>
        
        <WireMapper />
      </div>
    </main>
  );
}
