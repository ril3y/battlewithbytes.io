'use client';

import React from 'react';
import { OhmsLawResults } from './index';
import { formatValueWithSuffix, parseFieldValue } from '../../../lib/utils/inputUtils';

interface DescriptionProps {
  results: OhmsLawResults;
}

const Description: React.FC<DescriptionProps> = ({ results }) => {
  if (!results.calculatedProperty) {
    return (
      <div className="ohms-law-description p-6 bg-black/30 border border-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Results</h3>
        <p className="text-gray-300 font-mono">
          {results.description || "Enter values for two parameters and click 'Calculate' to see results."}
        </p>
      </div>
    );
  }
  
  // Format values for display with appropriate units
  const voltage = formatValueWithSuffix(parseFloat(results.voltage), 'V');
  
  // Special handling for current to display mA when appropriate
  let current;
  
  // Check if the original input was in milliamps format
  const isInputInMilliamps = results.current && 
    (results.current.toLowerCase().includes('ma') || 
     (results.current.toLowerCase().includes('m') && !results.current.toLowerCase().includes('ma')));
  
  // For direct user input (not calculated values), preserve the original format
  if (results.calculatedProperty !== 'current' && isInputInMilliamps) {
    // Just use the original input value
    current = results.current;
  } else if (results.displayCurrentInMilliamps || parseFloat(results.current) < 0.1) {
    // For calculated values or small values, format as mA
    const currentValue = parseFloat(results.current);
    current = `${(currentValue * 1000).toFixed(3)}mA`;
  } else {
    // For larger values, use amps
    current = formatValueWithSuffix(parseFloat(results.current), 'A');
  }
  
  const resistance = formatValueWithSuffix(parseFloat(results.resistance), 'Ω');
  const power = formatValueWithSuffix(parseFloat(results.power), 'W');
  
  // Helper function to determine if a value was calculated
  const isCalculated = (property: string) => results.calculatedProperty === property;
  
  // Helper function to render a value with appropriate styling
  const renderValue = (label: string, value: string, property: string) => {
    const calculated = isCalculated(property);
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className={`
          font-mono text-lg p-2 rounded-md flex items-center
          ${calculated 
            ? 'bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d]' 
            : 'bg-black/20 border border-gray-800 text-gray-300'}
        `}>
          {value}
          {calculated && (
            <span className="ml-2 text-xs bg-[#00ff9d]/20 px-2 py-1 rounded-sm">
              CALCULATED
            </span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="ohms-law-description p-6 bg-black/30 border border-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderValue("Voltage", voltage, "voltage")}
        {renderValue("Current", current, "current")}
        {renderValue("Resistance", resistance, "resistance")}
        {renderValue("Power", power, "power")}
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2 text-[#00ff9d]">Calculation Details</h4>
        <div className="bg-black/40 border border-gray-800 rounded-md p-4 font-mono text-sm text-gray-300">
          <p>{results.description}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h5 className="text-sm font-bold mb-2 text-[#00ff9d]">Ohm's Law Formulas</h5>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li className={results.calculatedProperty === 'voltage' ? 'text-[#00ff9d]' : ''}>
                Voltage (V) = Current (I) × Resistance (R)
              </li>
              <li className={results.calculatedProperty === 'current' ? 'text-[#00ff9d]' : ''}>
                Current (I) = Voltage (V) ÷ Resistance (R)
              </li>
              <li className={results.calculatedProperty === 'resistance' ? 'text-[#00ff9d]' : ''}>
                Resistance (R) = Voltage (V) ÷ Current (I)
              </li>
              <li className={results.calculatedProperty === 'power' ? 'text-[#00ff9d]' : ''}>
                Power (P) = Voltage (V) × Current (I)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Description;
