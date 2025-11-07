'use client';

import React from 'react';

interface MosfetDiagramProps {
  mosfetType: string;
  inputValues: {
    vg: string;
    vcc: string;
    vd: string;
    vs: string;
    loadResistance: string;
  };
}

export default function MosfetDiagram({ mosfetType, inputValues }: MosfetDiagramProps) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Circuit Diagram</h3>
      <div className="mosfet-diagram">
        {mosfetType === 'n-channel' ? (
          <div className="relative w-full h-64 bg-black/30 rounded-lg p-4">
            <svg viewBox="0 0 300 200" className="w-full h-full">
              {/* VCC Connection */}
              <line x1="150" y1="20" x2="150" y2="50" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Load Resistor */}
              <path d="M150,50 L140,55 L160,65 L140,75 L160,85 L140,95 L160,105 L150,110" fill="none" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Resistor Value */}
              {inputValues.loadResistance && (
                <text x="170" y="80" fill="#00ff9d" className="text-sm font-mono">
                  {inputValues.loadResistance}Ω
                </text>
              )}
              
              {/* VCC Label */}
              <text x="135" y="10" fill="#ff5555" className="text-sm font-mono">
                {inputValues.vcc ? `${inputValues.vcc}V` : 'VCC'}
              </text>
              
              {/* N-Channel Enhancement MOSFET Symbol (Wikipedia style) */}
              {/* Drain Connection */}
              <line x1="150" y1="110" x2="150" y2="125" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Source Connection */}
              <line x1="150" y1="175" x2="150" y2="190" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Connection */}
              <line x1="100" y1="150" x2="130" y2="150" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Channel Line */}
              <line x1="150" y1="125" x2="150" y2="175" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate */}
              <line x1="130" y1="135" x2="130" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Insulation Gap */}
              <line x1="130" y1="150" x2="140" y2="150" stroke="transparent" strokeWidth="2" />
              
              {/* Substrate/Body */}
              <line x1="140" y1="135" x2="140" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Substrate Connection */}
              <line x1="140" y1="150" x2="145" y2="150" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Three parallel lines representing the channel */}
              <line x1="140" y1="135" x2="150" y2="135" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="150" x2="150" y2="150" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="165" x2="150" y2="165" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Arrow indicating N-Channel (pointing inward) */}
              <polygon points="145,155 150,150 145,145" fill="#00ff9d" stroke="#00ff9d" strokeWidth="1" />
              
              {/* Ground Symbol */}
              <line x1="150" y1="190" x2="150" y2="195" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="195" x2="160" y2="195" stroke="#00ff9d" strokeWidth="2" />
              <line x1="143" y1="200" x2="157" y2="200" stroke="#00ff9d" strokeWidth="2" />
              <line x1="146" y1="205" x2="154" y2="205" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Label */}
              <text x="80" y="150" fill="#00ff9d" className="text-sm font-mono" textAnchor="end">
                G {inputValues.vg ? `(${inputValues.vg}V)` : ''}
              </text>
              
              {/* Drain Label */}
              <text x="170" y="125" fill="#ffffff" className="text-sm font-mono" textAnchor="start">
                D {inputValues.vd ? `(${inputValues.vd}V)` : ''}
              </text>
              
              {/* Source Label */}
              <text x="170" y="175" fill="#ff9900" className="text-sm font-mono" textAnchor="start">
                S {inputValues.vs ? `(${inputValues.vs}V)` : '(0V)'}
              </text>
            </svg>
          </div>
        ) : (
          <div className="relative w-full h-64 bg-black/30 rounded-lg p-4">
            <svg viewBox="0 0 300 200" className="w-full h-full">
              {/* VCC Connection */}
              <line x1="150" y1="20" x2="150" y2="25" stroke="#00ff9d" strokeWidth="2" />
              
              {/* P-Channel Enhancement MOSFET Symbol (Wikipedia style) */}
              {/* Source Connection */}
              <line x1="150" y1="25" x2="150" y2="40" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Drain Connection */}
              <line x1="150" y1="90" x2="150" y2="110" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Connection */}
              <line x1="100" y1="65" x2="130" y2="65" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Channel Line */}
              <line x1="150" y1="40" x2="150" y2="90" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate */}
              <line x1="130" y1="50" x2="130" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Insulation Gap */}
              <line x1="130" y1="65" x2="140" y2="65" stroke="transparent" strokeWidth="2" />
              
              {/* Substrate/Body */}
              <line x1="140" y1="50" x2="140" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Substrate Connection */}
              <line x1="140" y1="65" x2="145" y2="65" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Three parallel lines representing the channel */}
              <line x1="140" y1="50" x2="150" y2="50" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="65" x2="150" y2="65" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="80" x2="150" y2="80" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Arrow indicating P-Channel (pointing outward) */}
              <polygon points="145,55 140,65 145,75" fill="#00ff9d" stroke="#00ff9d" strokeWidth="1" />
              
              {/* VCC Label */}
              <text x="135" y="10" fill="#ff5555" className="text-sm font-mono">
                {inputValues.vcc ? `${inputValues.vcc}V` : 'VCC'}
              </text>
              
              {/* Load Resistor */}
              <path d="M150,110 L140,115 L160,125 L140,135 L160,145 L140,155 L160,165 L150,170" fill="none" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Resistor Value */}
              {inputValues.loadResistance && (
                <text x="170" y="140" fill="#00ff9d" className="text-sm font-mono">
                  {inputValues.loadResistance}Ω
                </text>
              )}
              
              {/* Ground Symbol */}
              <line x1="150" y1="170" x2="150" y2="180" stroke="#00ff9d" strokeWidth="2" />
              <line x1="140" y1="180" x2="160" y2="180" stroke="#00ff9d" strokeWidth="2" />
              <line x1="143" y1="185" x2="157" y2="185" stroke="#00ff9d" strokeWidth="2" />
              <line x1="146" y1="190" x2="154" y2="190" stroke="#00ff9d" strokeWidth="2" />
              
              {/* Gate Label */}
              <text x="80" y="65" fill="#00ff9d" className="text-sm font-mono" textAnchor="end">
                G {inputValues.vg ? `(${inputValues.vg}V)` : ''}
              </text>
              
              {/* Source Label */}
              <text x="170" y="40" fill="#ff9900" className="text-sm font-mono" textAnchor="start">
                S {inputValues.vs ? `(${inputValues.vs}V)` : ''}
              </text>
              
              {/* Drain Label */}
              <text x="170" y="90" fill="#ffffff" className="text-sm font-mono" textAnchor="start">
                D {inputValues.vd ? `(${inputValues.vd}V)` : ''}
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
