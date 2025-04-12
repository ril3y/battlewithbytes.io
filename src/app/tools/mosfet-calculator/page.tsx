'use client';

import { Metadata } from 'next';
import MosfetCalculator from '@/components/tools/MosfetCalculator';

export default function MosfetCalculatorPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-8 glow-text">
          <span className="text-green-400">&lt;</span> MOSFET Calculator <span className="text-green-400">/&gt;</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-3xl">
          An interactive tool for calculating MOSFET parameters, visualizing configurations, 
          and determining conduction states for both N-channel and P-channel MOSFETs.
        </p>
        
        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 mb-8">
          <MosfetCalculator />
        </div>
        
        <div className="bg-black/70 border border-gray-800 rounded-lg p-6 font-mono text-sm">
          <h3 className="text-xl font-bold mb-4 text-green-400">About This Tool</h3>
          <p className="mb-4 text-gray-300">
            This MOSFET calculator helps engineers and hobbyists determine whether a MOSFET is conducting 
            based on the applied voltages and component specifications.
          </p>
          <p className="mb-4 text-gray-300">
            The tool supports both N-channel and P-channel MOSFETs, and provides detailed calculations 
            including gate-source voltage (Vgs), drain current (Id), and power dissipation.
          </p>
          <p className="text-gray-300">
            Use this calculator to design and troubleshoot MOSFET-based circuits for switching applications, 
            power control, and signal amplification.
          </p>
        </div>
      </div>
    </main>
  );
}
