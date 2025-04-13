'use client';

import React, { useState, useCallback } from 'react';
import Tooltip from '../../../lib/utils/Tooltip';
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  // isValidNumberInput, // Less critical now, validation happens in useEffect
  // isValidResistance, // Can keep for basic input filtering if desired
  isValidVoltage,   // Can keep for basic input filtering if desired
  getParameterWarning, // Assuming these are correctly defined elsewhere
  getParameterTooltip  // Assuming these are correctly defined elsewhere
} from '../../../lib/utils/inputUtils';
import mosfetData from './mosfetData.json';

// --- Interfaces (Assume they are correct) ---
interface MosfetDetails {
    vth: number;
    rds_on: number;
    Id: string;
    P_max: string;
    Vds_max: string;
    Vgs_max: string;
  }

interface PChannelMosfets {
[key: string]: MosfetDetails;
}

interface PChannelMosfetConfigurationProps {
  mosfetName: string;
  mosfetDetails: { vth: string; rds_on: string };
  inputValues: {
    vg: string;
    vs: string;     // Vs is crucial for P-channel calculation
    loadResistance: string;
  };
  onDetailsChange: (name: string, details: { vth: string; rds_on: string }) => void;
  onInputChange: (name: string, value: string) => void;
}

// --- Component ---
// Use the interface for props
export default function PChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange
}: PChannelMosfetConfigurationProps) {
  const pChannelMosfets = mosfetData.mosfets['p-channel'] as PChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  // --- Event Handlers (Simplified) ---

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setWarnings({}); // Reset warnings
    if (selectedName === '') {
      onDetailsChange('', { vth: '', rds_on: '' });
      return;
    }
    if (selectedName === 'custom') {
      onDetailsChange(selectedName, { vth: '', rds_on: '' });
      return;
    }
    const selectedMosfet = pChannelMosfets[selectedName];
    onDetailsChange(selectedName, {
      vth: selectedMosfet.vth.toString(),
      rds_on: selectedMosfet.rds_on.toString()
    });
    // Calculation triggers via useEffect
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let isValid = true; // Assume valid initially or for empty string

    // Optional: Basic validation for immediate feedback
    if (value !== '') {
        if (name === 'loadResistance') {
            // isValid = isValidResistance(value); // Optional strict check
        } else if (['vg', 'vs'].includes(name)) {
             isValid = isValidVoltage(value);
        }
    }

    if (isValid) { // Update state only if potentially valid or empty
        onInputChange(name, value);
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
     // Calculation triggers via useEffect
  }, [onInputChange]);

  const handleCustomParamChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let isValid = true; // Assume valid initially or for empty string

    // Optional: Basic validation
     if (value !== '') {
        if (name === 'rds_on') {
            // isValid = isValidResistance(value); // Optional strict check
        } else if (name === 'vth') {
            isValid = isValidVoltage(value); // Check voltage format
        }
     }

    if (isValid) {
        onDetailsChange('custom', {...mosfetDetails, [name]: value});
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
    // Calculation triggers via useEffect
  }, [mosfetDetails, onDetailsChange]);

  // --- JSX Rendering (Using Tooltip component) ---
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">P-Channel Configuration</h3>

      <div className="mosfet-inputs">
        <div>
          <label className="mosfet-label">Select MOSFET</label>
          <select
            className="mosfet-select"
            value={mosfetName}
            onChange={handleMosfetSelect}
          >
            <option value="">-- Select a MOSFET --</option>
            <option value="custom">-- Custom MOSFET --</option>
            {Object.keys(pChannelMosfets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {mosfetName === 'custom' ? (
          <>
            {/* Vth Input */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  name="vth"
                  className="mosfet-input"
                  value={mosfetDetails.vth}
                  onChange={handleCustomParamChange}
                  placeholder="e.g., -2 (MUST be negative)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For P-Channel MOSFETs, Vth should be negative.</small>
              {warnings.vth && <div className="text-yellow-400 text-sm mt-1">{warnings.vth}</div>}
            </div>

            {/* Rds_on Input */}
             <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  name="rds_on"
                  className="mosfet-input"
                  value={mosfetDetails.rds_on}
                  onChange={handleCustomParamChange}
                  placeholder="Enter on resistance (e.g., 22m)"
                />
              </Tooltip>
               <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.rds_on && <div className="text-yellow-400 text-sm mt-1">{warnings.rds_on}</div>}
            </div>

            {/* Vg Input */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

            {/* Vs Input - Crucial for P-Channel */}
             <div>
              <label className="mosfet-label">Source Voltage (Vs - Connects to Supply)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Enter voltage at Source (usually Vcc)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For high-side switching, Vs is typically connected to the positive supply (Vcc).</small>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

            {/* Load Resistance Input */}
             <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        ) : mosfetName && (
          <>
            {/* Read-only Vth */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <Tooltip text={getParameterTooltip('vth')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseFloat(mosfetDetails.vth || 'NaN'), 'V')} // Format value
                  readOnly
                />
              </Tooltip>
            </div>

            {/* Read-only Rds_on */}
            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <Tooltip text={getParameterTooltip('rds_on')}>
                <input
                  type="text"
                  className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                  value={formatValueWithSuffix(parseValueWithSuffix(mosfetDetails.rds_on || '0'), 'Ω')} // Format value
                  readOnly
                />
              </Tooltip>
            </div>

            {/* Editable Vg, Vs, LoadResistance */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <Tooltip text={getParameterTooltip('vg')}>
                <input
                  type="text"
                  name="vg"
                  className="mosfet-input"
                  value={inputValues.vg}
                  onChange={handleInputChange}
                  placeholder="Enter gate voltage"
                />
              </Tooltip>
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

             <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <Tooltip text={getParameterTooltip('vs')}>
                <input
                  type="text"
                  name="vs"
                  className="mosfet-input"
                  value={inputValues.vs}
                  onChange={handleInputChange}
                  placeholder="Enter voltage at Source (usually Vcc)"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">For high-side switching, Vs is typically connected to the positive supply (Vcc).</small>
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

             <div>
              <label className="mosfet-label">Load Resistance</label>
              <Tooltip text={getParameterTooltip('loadResistance')}>
                <input
                  type="text"
                  name="loadResistance"
                  className="mosfet-input"
                  value={inputValues.loadResistance}
                  onChange={handleInputChange}
                  placeholder="Enter load resistance"
                />
              </Tooltip>
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}