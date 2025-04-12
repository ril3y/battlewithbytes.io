import OhmsLawCalculator from '@/components/tools/OhmsLawCalculator';

export const metadata = {
  title: 'Ohm\'s Law Calculator | Battle With Bytes',
  description: 'Calculate voltage, current, resistance, and power using Ohm\'s Law with an interactive visualization and detailed explanations.',
};

export default function OhmsLawCalculatorPage() {
  return (
    <main className="min-h-screen py-16 px-4">
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
