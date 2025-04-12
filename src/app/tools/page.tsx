import Link from 'next/link';

export default function ToolsPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> Interactive Tools <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Explore a collection of interactive engineering tools designed to simplify calculations 
          and provide insights for hardware and software projects.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* MOSFET Calculator Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">01 // ELECTRONICS</div>
              <h3 className="text-xl font-bold mb-3">MOSFET Calculator</h3>
              <p className="text-gray-400 mb-4">
                Interactive tool for calculating MOSFET parameters, visualizing configurations, and determining conduction states.
              </p>
              <Link href="/tools/mosfet-calculator" className="text-green-400 font-mono text-sm hover:underline">
                Open tool →
              </Link>
            </div>
          </div>
          
          {/* Ohm's Law Calculator Card */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">02 // ELECTRONICS</div>
              <h3 className="text-xl font-bold mb-3">Ohm's Law Calculator</h3>
              <p className="text-gray-400 mb-4">
                Calculate voltage, current, resistance, and power using Ohm's Law with an interactive visualization and detailed explanations.
              </p>
              <Link href="/tools/ohms-law-calculator" className="text-green-400 font-mono text-sm hover:underline">
                Open tool →
              </Link>
            </div>
          </div>
          
          {/* Placeholder for future tools */}
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden opacity-50">
            <div className="p-6">
              <div className="text-green-400 font-mono text-sm mb-2">COMING SOON</div>
              <h3 className="text-xl font-bold mb-3">More Tools</h3>
              <p className="text-gray-400 mb-4">
                Additional engineering and cybersecurity tools are in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
