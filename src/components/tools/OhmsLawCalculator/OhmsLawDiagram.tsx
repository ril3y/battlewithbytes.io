'use client';

import React from 'react';
import { OhmsLawValues } from './index';

interface OhmsLawDiagramProps {
  values: OhmsLawValues;
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
}

const OhmsLawDiagram: React.FC<OhmsLawDiagramProps> = ({ values, calculatedProperty }) => {
  // Determine which values to highlight based on what was calculated
  const getHighlightColor = (property: 'voltage' | 'current' | 'resistance' | 'power') => {
    if (calculatedProperty === property) {
      return '#00ff9d'; // Highlight calculated value with primary accent color
    }
    return '#ededed'; // Default color
  };

  return (
    <div className="ohms-law-diagram">
      <div className="relative w-full h-64 bg-black/30 rounded-lg p-4">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {/* Ohm's Law Triangle */}
          <g transform="translate(150, 150)">
            {/* Circle background */}
            <circle cx="0" cy="0" r="120" fill="rgba(0,0,0,0.3)" stroke="#333" strokeWidth="1" />
            
            {/* Ohm's Law Formula Circle */}
            <circle cx="0" cy="0" r="100" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Voltage (V) */}
            <g transform="translate(0, -70)">
              <circle 
                cx="0" 
                cy="0" 
                r="30" 
                fill={calculatedProperty === 'voltage' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(0, 0, 0, 0.3)'} 
                stroke={getHighlightColor('voltage')} 
                strokeWidth="2"
              />
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill={getHighlightColor('voltage')} 
                className="text-xl font-mono font-bold"
              >
                V
              </text>
              {values.voltage && (
                <text 
                  x="0" 
                  y="40" 
                  textAnchor="middle" 
                  fill={getHighlightColor('voltage')} 
                  className="text-sm font-mono"
                >
                  {values.voltage}V
                </text>
              )}
            </g>
            
            {/* Current (I) */}
            <g transform="translate(-70, 35)">
              <circle 
                cx="0" 
                cy="0" 
                r="30" 
                fill={calculatedProperty === 'current' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(0, 0, 0, 0.3)'} 
                stroke={getHighlightColor('current')} 
                strokeWidth="2"
              />
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill={getHighlightColor('current')} 
                className="text-xl font-mono font-bold"
              >
                I
              </text>
              {values.current && (
                <text 
                  x="0" 
                  y="40" 
                  textAnchor="middle" 
                  fill={getHighlightColor('current')} 
                  className="text-sm font-mono"
                >
                  {values.current}A
                </text>
              )}
            </g>
            
            {/* Resistance (R) */}
            <g transform="translate(70, 35)">
              <circle 
                cx="0" 
                cy="0" 
                r="30" 
                fill={calculatedProperty === 'resistance' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(0, 0, 0, 0.3)'} 
                stroke={getHighlightColor('resistance')} 
                strokeWidth="2"
              />
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill={getHighlightColor('resistance')} 
                className="text-xl font-mono font-bold"
              >
                R
              </text>
              {values.resistance && (
                <text 
                  x="0" 
                  y="40" 
                  textAnchor="middle" 
                  fill={getHighlightColor('resistance')} 
                  className="text-sm font-mono"
                >
                  {values.resistance}Ω
                </text>
              )}
            </g>
            
            {/* Power (P) */}
            <g transform="translate(0, 70)">
              <circle 
                cx="0" 
                cy="0" 
                r="30" 
                fill={calculatedProperty === 'power' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(0, 0, 0, 0.3)'} 
                stroke={getHighlightColor('power')} 
                strokeWidth="2"
              />
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill={getHighlightColor('power')} 
                className="text-xl font-mono font-bold"
              >
                P
              </text>
              {values.power && (
                <text 
                  x="0" 
                  y="40" 
                  textAnchor="middle" 
                  fill={getHighlightColor('power')} 
                  className="text-sm font-mono"
                >
                  {values.power}W
                </text>
              )}
            </g>
            
            {/* Relationship lines */}
            <line x1="0" y1="-40" x2="-40" y2="15" stroke="#555" strokeWidth="1" />
            <line x1="0" y1="-40" x2="40" y2="15" stroke="#555" strokeWidth="1" />
            <line x1="-40" y1="15" x2="40" y2="15" stroke="#555" strokeWidth="1" />
            <line x1="0" y1="40" x2="-40" y2="15" stroke="#555" strokeWidth="1" />
            <line x1="0" y1="40" x2="40" y2="15" stroke="#555" strokeWidth="1" />
            
            {/* Formulas */}
            <text x="0" y="-10" textAnchor="middle" fill="#888" className="text-xs font-mono">V = I × R</text>
            <text x="0" y="10" textAnchor="middle" fill="#888" className="text-xs font-mono">P = V × I</text>
          </g>
        </svg>
      </div>
      <div className="mt-4 text-center text-sm text-gray-400 font-mono">
        <p>Ohm's Law: V = I × R</p>
        <p>Power: P = V × I = I² × R = V²/R</p>
      </div>
    </div>
  );
};

export default OhmsLawDiagram;
