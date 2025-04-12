'use client';

import React from 'react';
import { OhmsLawResults } from './index';
import { formatValueWithSuffix } from '../../../lib/utils/inputUtils';

interface DescriptionProps {
  results: OhmsLawResults;
}

const Description: React.FC<DescriptionProps> = ({ results }) => {
  if (!results.calculatedProperty) {
    return null;
  }

  const formatValue = (value: string, unit: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return formatValueWithSuffix(numValue, unit);
  };

  return (
    <div className="ohms-law-description mt-8 p-6 bg-black/30 rounded-lg border border-gray-800">
      <h3 className="text-xl font-bold mb-4 font-mono text-[#00ff9d]">Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold mb-2 font-mono">Calculated Values</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-md ${results.calculatedProperty === 'voltage' ? 'bg-[#00ff9d]/10 border border-[#00ff9d]' : 'bg-black/20 border border-gray-700'}`}>
                <div className="text-sm text-gray-400">Voltage</div>
                <div className="text-xl font-mono">{formatValue(results.voltage, 'V')}</div>
              </div>
              <div className={`p-3 rounded-md ${results.calculatedProperty === 'current' ? 'bg-[#00ff9d]/10 border border-[#00ff9d]' : 'bg-black/20 border border-gray-700'}`}>
                <div className="text-sm text-gray-400">Current</div>
                <div className="text-xl font-mono">{formatValue(results.current, 'A')}</div>
              </div>
              <div className={`p-3 rounded-md ${results.calculatedProperty === 'resistance' ? 'bg-[#00ff9d]/10 border border-[#00ff9d]' : 'bg-black/20 border border-gray-700'}`}>
                <div className="text-sm text-gray-400">Resistance</div>
                <div className="text-xl font-mono">{formatValue(results.resistance, 'Ω')}</div>
              </div>
              <div className={`p-3 rounded-md ${results.calculatedProperty === 'power' ? 'bg-[#00ff9d]/10 border border-[#00ff9d]' : 'bg-black/20 border border-gray-700'}`}>
                <div className="text-sm text-gray-400">Power</div>
                <div className="text-xl font-mono">{formatValue(results.power, 'W')}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-2 font-mono">Explanation</h4>
          <div className="bg-black/20 p-4 rounded-md border border-gray-700">
            <p className="text-gray-300 font-mono text-sm leading-relaxed">
              {results.description}
            </p>
          </div>
          
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2 font-mono">Formulas Used</h4>
            <div className="bg-black/20 p-4 rounded-md border border-gray-700 font-mono text-sm">
              {results.calculatedProperty === 'voltage' && (
                <div>
                  <p className="mb-2">V = I × R</p>
                  <p>V = {results.current}A × {results.resistance}Ω = {results.voltage}V</p>
                </div>
              )}
              {results.calculatedProperty === 'current' && (
                <div>
                  <p className="mb-2">I = V / R</p>
                  <p>I = {results.voltage}V / {results.resistance}Ω = {results.current}A</p>
                </div>
              )}
              {results.calculatedProperty === 'resistance' && (
                <div>
                  <p className="mb-2">R = V / I</p>
                  <p>R = {results.voltage}V / {results.current}A = {results.resistance}Ω</p>
                </div>
              )}
              {results.calculatedProperty === 'power' && (
                <div>
                  <p className="mb-2">P = V × I</p>
                  <p>P = {results.voltage}V × {results.current}A = {results.power}W</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Description;
