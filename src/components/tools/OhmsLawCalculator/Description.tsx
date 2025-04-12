'use client';

import React from 'react';
import { OhmsLawResults } from './index'; // Assuming OhmsLawResults is defined in index.tsx
// Import only the necessary utility
import { formatValueWithSuffix } from '../../../lib/utils/inputUtils';

interface DescriptionProps {
  results: OhmsLawResults;
}

const Description: React.FC<DescriptionProps> = ({ results }) => {
  // If no calculation has been performed yet, show placeholder or initial message
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

  // --- Consistent Value Formatting ---
  // Parse the string results back to numbers for reliable formatting
  // Add fallback ('NaN') in case results somehow contain invalid strings
  const voltageNumeric = parseFloat(results.voltage || 'NaN');
  const currentNumeric = parseFloat(results.current || 'NaN');
  const resistanceNumeric = parseFloat(results.resistance || 'NaN');
  const powerNumeric = parseFloat(results.power || 'NaN');

  // Format Voltage, Resistance, Power using the utility
  const voltageDisplay = isNaN(voltageNumeric) ? 'Invalid' : formatValueWithSuffix(voltageNumeric, 'V');
  const resistanceDisplay = isNaN(resistanceNumeric) ? 'Invalid' : formatValueWithSuffix(resistanceNumeric, 'Ω');
  const powerDisplay = isNaN(powerNumeric) ? 'Invalid' : formatValueWithSuffix(powerNumeric, 'W');

  // Format Current based on the displayCurrentInMilliamps flag
  let currentDisplay: string;
  if (isNaN(currentNumeric)) {
      currentDisplay = 'Invalid'; // Handle potential NaN result
  } else if (results.displayCurrentInMilliamps) {
      // Format as mA
      currentDisplay = `${(currentNumeric * 1000).toFixed(3)}mA`;
  } else {
      // Format as A using the utility function
      currentDisplay = formatValueWithSuffix(currentNumeric, 'A');
  }
  // --- End of Consistent Value Formatting ---

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
          {/* Render the correctly formatted display value */}
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

  // Main component structure
  return (
    <div className="ohms-law-description p-6 bg-black/30 border border-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Results</h3>

      {/* Grid for displaying the values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderValue("Voltage", voltageDisplay, "voltage")}
        {renderValue("Current", currentDisplay, "current")}
        {renderValue("Resistance", resistanceDisplay, "resistance")}
        {renderValue("Power", powerDisplay, "power")}
      </div>

      {/* Section for calculation details and formulas */}
      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2 text-[#00ff9d]">Calculation Details</h4>
        <div className="bg-black/40 border border-gray-800 rounded-md p-4 font-mono text-sm text-gray-300">
          {/* Display the description from the results */}
          <p>{results.description}</p>

          {/* Ohm's Law Formulas Section */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h5 className="text-sm font-bold mb-2 text-[#00ff9d]">Ohm&apos;s Law Formulas Used</h5>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li className={results.calculatedProperty === 'voltage' ? 'text-[#00ff9d]' : ''}>
                Voltage (V) = Current (I) × Resistance (R)  |  V = P / I  |  V = √(P × R)
              </li>
              <li className={results.calculatedProperty === 'current' ? 'text-[#00ff9d]' : ''}>
                Current (I) = Voltage (V) ÷ Resistance (R)  |  I = P / V  |  I = √(P / R)
              </li>
              <li className={results.calculatedProperty === 'resistance' ? 'text-[#00ff9d]' : ''}>
                Resistance (R) = Voltage (V) ÷ Current (I)  |  R = V² / P  |  R = P / I²
              </li>
              <li className={results.calculatedProperty === 'power' ? 'text-[#00ff9d]' : ''}>
                Power (P) = Voltage (V) × Current (I)  |  P = V² / R  |  P = I² × R
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Description;