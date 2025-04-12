import OhmsLawCalculator from '@/components/tools/OhmsLawCalculator';
import { generateToolSchema } from '@/lib/utils/seo';
import Script from 'next/script';

// Enhanced SEO metadata
export const metadata = {
  title: 'Ohm\'s Law Calculator | Battle With Bytes',
  description: 'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations. Free online electrical engineering tool.',
  keywords: ['ohm\'s law', 'voltage calculator', 'current calculator', 'resistance calculator', 'power calculator', 'electrical engineering', 'circuit design', 'electronics tool'],
  openGraph: {
    title: 'Ohm\'s Law Calculator | Battle With Bytes',
    description: 'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations.',
    type: 'website',
    url: 'https://battlewithbytes.io/tools/ohms-law-calculator',
    images: [
      {
        url: '/images/og/ohms-law-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Ohm\'s Law Calculator',
      },
    ],
  },
};

export default function OhmsLawCalculatorPage() {
  // Tool schema for structured data
  const toolSchema = generateToolSchema(
    'Ohm\'s Law Calculator',
    'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations.',
    '/tools/ohms-law-calculator'
  );

  return (
    <main className="min-h-screen py-16 px-4">
      {/* Structured data for search engines */}
      <Script id="ohms-law-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Ohm&apos;s Law Calculator <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Calculate voltage, current, resistance, and power using Ohm&apos;s Law. 
          This interactive tool provides visual feedback and detailed explanations of the calculations.
        </p>
        
        <OhmsLawCalculator />
      </div>
    </main>
  );
}
