'use client';

import React from 'react';
import { OhmsLawValues } from './index';
import { parseFieldValue, formatValueWithSuffix } from '../../../lib/utils/inputUtils';

interface OhmsLawDiagramProps {
  values: OhmsLawValues;
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
}

/**
 * Format a value for display in the diagram with appropriate units
 * 
 * @param value The value to format
 * @param fieldType The type of field (voltage, current, resistance, power)
 * @returns Formatted value with appropriate unit
 */
const formatDisplayValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return '';
  
  const numericValue = parseFieldValue(value, fieldType as any);
  
  // Special handling for current to display mA when appropriate
  if (fieldType === 'current') {
    // Check if the original input was in milliamps format
    const isInputInMilliamps = value && 
      (value.toLowerCase().includes('ma') || 
       (value.toLowerCase().includes('m') && !value.toLowerCase().includes('ma')));
    
    // Display in mA if value is small or explicitly entered with mA suffix
    if (numericValue < 0.1 || isInputInMilliamps) {
      // If it's an explicit milliamp input, preserve the original format
      if (isInputInMilliamps) {
        // Extract the numeric part from the original input
        const match = value.match(/^(\d*\.?\d*)/);
        if (match && match[1]) {
          return `${match[1]}mA`;
        }
      }
      // Otherwise format consistently
      return `${(numericValue * 1000).toFixed(3)}mA`;
    }
    return formatValueWithSuffix(numericValue, 'A');
  }
  
  // Handle other field types
  switch (fieldType) {
    case 'voltage':
      return formatValueWithSuffix(numericValue, 'V');
    case 'resistance':
      return formatValueWithSuffix(numericValue, 'Ω');
    case 'power':
      return formatValueWithSuffix(numericValue, 'W');
    default:
      return value;
  }
};

const OhmsLawDiagram: React.FC<OhmsLawDiagramProps> = ({ values, calculatedProperty }) => {
  // Determine which values to highlight based on what was calculated
  const getHighlightColor = (property: 'voltage' | 'current' | 'resistance' | 'power') => {
    return calculatedProperty === property 
      ? '#00ff9d' // Highlight calculated property
      : '#ffffff'; // Normal color for other properties
  };

  // Format display values with appropriate units
  const voltageDisplay = formatDisplayValue(values.voltage, 'voltage');
  const currentDisplay = formatDisplayValue(values.current, 'current');
  const resistanceDisplay = formatDisplayValue(values.resistance, 'resistance');
  const powerDisplay = formatDisplayValue(values.power, 'power');

  return (
    <div className="ohms-law-diagram">
      <div className="bg-black/30 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="text-sm text-[#00ff9d] font-mono mb-4">OHM'S LAW DIAGRAM</div>
        
        <div className="w-full max-w-md mx-auto">
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            {/* Circle */}
            <circle 
              cx="200" 
              cy="200" 
              r="150" 
              fill="none" 
              stroke="#333" 
              strokeWidth="1" 
            />
            
            {/* Horizontal and Vertical Lines */}
            <line 
              x1="50" y1="200" x2="350" y2="200" 
              stroke="#333" 
              strokeWidth="1" 
            />
            <line 
              x1="200" y1="50" x2="200" y2="350" 
              stroke="#333" 
              strokeWidth="1" 
            />
            
            {/* Voltage (Top) */}
            <g>
              <circle cx="200" cy="80" r="30" fill="#111" stroke="#444" />
              <text x="200" y="85" textAnchor="middle" fill="#888" fontSize="14">V</text>
              {values.voltage && (
                <text 
                  x="200" 
                  y="130" 
                  textAnchor="middle" 
                  fill={getHighlightColor('voltage')} 
                  className="text-sm font-mono"
                >
                  {voltageDisplay}
                </text>
              )}
            </g>
            
            {/* Current (Left) */}
            <g>
              <circle cx="80" cy="200" r="30" fill="#111" stroke="#444" />
              <text x="80" y="205" textAnchor="middle" fill="#888" fontSize="14">I</text>
              {values.current && (
                <text 
                  x="80" 
                  y="250" 
                  textAnchor="middle" 
                  fill={getHighlightColor('current')} 
                  className="text-sm font-mono"
                >
                  {currentDisplay}
                </text>
              )}
            </g>
            
            {/* Resistance (Right) */}
            <g>
              <circle cx="320" cy="200" r="30" fill="#111" stroke="#444" />
              <text x="320" y="205" textAnchor="middle" fill="#888" fontSize="14">R</text>
              {values.resistance && (
                <text 
                  x="320" 
                  y="250" 
                  textAnchor="middle" 
                  fill={getHighlightColor('resistance')} 
                  className="text-sm font-mono"
                >
                  {resistanceDisplay}
                </text>
              )}
            </g>
            
            {/* Power (Bottom) */}
            <g>
              <circle cx="200" cy="320" r="30" fill="#111" stroke="#444" />
              <text x="200" y="325" textAnchor="middle" fill="#888" fontSize="14">P</text>
              {values.power && (
                <text 
                  x="200" 
                  y="370" 
                  textAnchor="middle" 
                  fill={getHighlightColor('power')} 
                  className="text-sm font-mono"
                >
                  {powerDisplay}
                </text>
              )}
            </g>
            
            {/* Formulas */}
            <g>
              <rect x="150" y="170" width="100" height="60" fill="#111" stroke="#333" />
              <text x="200" y="190" textAnchor="middle" fill="#00ff9d" fontSize="10">V = I × R</text>
              <text x="200" y="205" textAnchor="middle" fill="#00ff9d" fontSize="10">I = V ÷ R</text>
              <text x="200" y="220" textAnchor="middle" fill="#00ff9d" fontSize="10">P = V × I</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawDiagram;
