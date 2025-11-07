'use client';

import React, { useState } from 'react';

interface DescriptionProps {
  description: string;
  conducting: boolean | null;
  voltageAcrossLoad: string;
  powerDissipated: string;
  currentThroughLoad: string;
  vgs: string;
  id: string;
  vd: string;
  mosfetDetails: {
    rds_on?: string;
    vgs_th?: string;
    type?: string;
    [key: string]: string | undefined;
  } | null;
  mosfetType: string;
  loadResistance: number | null;
}

export default function Description({
  description,
  conducting,
  voltageAcrossLoad,
  powerDissipated,
  currentThroughLoad,
  vgs,
  id,
  vd,
  mosfetDetails,
  mosfetType,
  loadResistance
}: DescriptionProps) {
  const [showMath, setShowMath] = useState(false);

  // Don't render anything if there's no description or description is empty
  if (!description || description.trim() === '') {
    return null;
  }

  // Generate the mathematical calculations explanation
  const generateMathExplanation = () => {
    if (!conducting && conducting !== false) return null;
    
    const vgsNum = parseFloat(vgs);
    const idNum = parseFloat(id);
    const vdNum = parseFloat(vd);
    const voltageAcrossLoadNum = parseFloat(voltageAcrossLoad);
    // These variables are declared but not used in the component
    // const currentThroughLoadNum = parseFloat(currentThroughLoad);
    // const powerDissipatedNum = parseFloat(powerDissipated);
    
    // This calculation is not used in the component
    // const recalculatedPower = idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0');
    
    return (
      <div className="math-explanation bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm mt-4">
        <h4 className="text-green-400 mb-2 text-lg">Mathematical Calculations:</h4>
        
        <div className="mb-3">
          <div className="text-gray-400">Gate-Source Voltage (Vgs):</div>
          <div className="text-white">Vgs = Vg - Vs = {vgsNum.toFixed(2)} V</div>
        </div>
        
        {conducting ? (
          <>
            <div className="mb-3">
              <div className="text-gray-400">Current through circuit (Id):</div>
              {mosfetType === 'n-channel' ? (
                <div className="text-white">Id = Vcc / (Rds_on + {loadResistance?.toFixed(2) ?? '?'}) = {idNum.toFixed(4)} A</div>
              ) : (
                <div className="text-white">Id = Vs / (Rds_on + {loadResistance?.toFixed(2) ?? '?'}) = {idNum.toFixed(4)} A</div>
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Voltage across load:</div>
              <div className="text-white">Vload = Id × Rload ({loadResistance?.toFixed(2) ?? '?'}) = {voltageAcrossLoadNum.toFixed(4)} V</div>
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Voltage at drain (Vd):</div>
              {/* Conditional Vd formula based on type */}
              {mosfetType === 'n-channel' ? (
                <div className="text-white">Vd (N-Ch) = Vcc - Vload = {vdNum.toFixed(4)} V</div> 
              ) : (
                <div className="text-white">Vd = Vload = {vdNum.toFixed(4)} V</div> 
                // Alternate display: Vd = Vs - (Id * Rds_on) = {vdNum.toFixed(4)} V
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-gray-400">Power dissipated by MOSFET:</div>
              <div className="text-white">
                P = Id² × Rds_on ({parseFloat(mosfetDetails?.rds_on || '0').toFixed(2)}Ω) = ({idNum.toFixed(4)} A)² × Rds_on = {(idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')).toFixed(6)} W 
                {(idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')) < 0.001 && ` (${((idNum * idNum * parseFloat(mosfetDetails?.rds_on || '0')) * 1000).toFixed(2)} mW)`}
              </div>
            </div>
          </>
        ) : (
          <div className="mb-3">
            <div className="text-gray-400">Since Vgs {vgsNum < 0 ? '>' : '<'} Vth, the MOSFET is in cutoff mode:</div>
            <div className="text-white">Id = 0 A</div>
            <div className="text-white">Vload = 0 V</div>
            <div className="text-white">Power dissipated = 0 W</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="description-container">
      <h3 className="text-xl font-bold mb-4 text-center">
        {conducting !== null && (
          <span className={conducting ? 'text-green-400' : 'text-red-400'}>
            MOSFET is {conducting ? 'CONDUCTING' : 'NOT CONDUCTING'}
          </span>
        )}
      </h3>
      
      <div className={`mosfet-output mb-4 ${conducting !== null ? (conducting ? 'conducting' : 'not-conducting') : ''}`}>
        {description}
      </div>
      
      {(voltageAcrossLoad || powerDissipated || currentThroughLoad || vgs || id || vd) && (
        <>
          <div className="results-grid">
            {vgs && (
              <div className="result-item">
                <div className="result-label">Gate-Source Voltage (Vgs)</div>
                <div className="result-value">{vgs} V</div>
              </div>
            )}
            
            {id && (
              <div className="result-item">
                <div className="result-label">Drain Current (Id)</div>
                <div className="result-value">{id} A</div>
              </div>
            )}
            
            {vd && (
              <div className="result-item">
                <div className="result-label">Drain Voltage (Vd)</div>
                <div className="result-value">{vd} V</div>
              </div>
            )}
            
            {voltageAcrossLoad && (
              <div className="result-item">
                <div className="result-label">Voltage Across Load</div>
                <div className="result-value">{voltageAcrossLoad} V</div>
              </div>
            )}
            
            {currentThroughLoad && (
              <div className="result-item">
                <div className="result-label">Current Through Load</div>
                <div className="result-value">{currentThroughLoad} A</div>
              </div>
            )}
            
            {powerDissipated && (
              <div className="result-item">
                <div className="result-label">Power Dissipated</div>
                <div className="result-value text-green-400">{powerDissipated}</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <button 
              className="mosfet-button w-auto px-4"
              onClick={() => setShowMath(!showMath)}
            >
              {showMath ? 'Hide Calculations' : 'Show Calculations'}
            </button>
          </div>
          
          {showMath && generateMathExplanation()}
        </>
      )}
    </div>
  );
}
