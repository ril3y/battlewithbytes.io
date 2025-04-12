'use client';

import React, { useState, useEffect } from 'react';
// import Tooltip from '../../../lib/utils/Tooltip'; // Commented out unused import
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  // isValidNumberInput, // Commented out unused import
  // isValidResistance, // Commented out unused import
  isValidVoltage,
  getParameterWarning, // Assuming these are correctly defined elsewhere
  getParameterTooltip  // Assuming these are correctly defined elsewhere
} from '../../../lib/utils/inputUtils';
import mosfetData from './mosfetData.json';
import { calculateNChannelConduction } from './mosfetUtils'; // Assuming this is correct

// ... (Interfaces remain the same) ...
interface MosfetDetails {
  vth: number;
  rds_on: number;
  Id: string;
  P_max: string;
  Vds_max: string;
  Vgs_max: string;
}

interface NChannelMosfets {
  [key: string]: MosfetDetails;
}

interface NChannelMosfetConfigurationProps {
  mosfetName: string;
  mosfetDetails: { vth: string; rds_on: string };
  inputValues: {
    vg: string;
    vcc: string;
    // vd: string; // vd seems unused as input, likely an output
    vs: string;
    loadResistance: string;
  };
  onDetailsChange: (name: string, details: { vth: string; rds_on: string }) => void;
  onInputChange: (name: string, value: string) => void;
  updateDescription: (
    desc: string,
    isConducting: boolean | null,
    voltageAcrossLoad: string,
    powerDissipated: string,
    currentThroughLoad: string,
    vgs: string,
    id: string,
    vd: string // vd is an output parameter
  ) => void;
}


export default function NChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange,
  updateDescription
}: NChannelMosfetConfigurationProps) {
  const nChannelMosfets = mosfetData.mosfets['n-channel'] as NChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  // --- Event Handlers (Simplified) ---

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    // Reset warnings when changing MOSFET
    setWarnings({});
    if (selectedName === '') {
      onDetailsChange('', { vth: '', rds_on: '' });
      // updateDescription('', null, '', '', '', '', '', ''); // Let useEffect handle initial/empty state
      return;
    }

    if (selectedName === 'custom') {
      onDetailsChange(selectedName, { vth: '', rds_on: '' });
      return;
    }

    const selectedMosfet = nChannelMosfets[selectedName];
    onDetailsChange(selectedName, {
      vth: selectedMosfet.vth.toString(),
      rds_on: selectedMosfet.rds_on.toString() // Store Rds_on as string from data
    });
     // Calculation will trigger via useEffect dependency change
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Basic validation for immediate feedback (optional, but good UX)
    let isValid = true;
    if (name === 'loadResistance') {
      // Use the actual validation function if needed for input filtering
      // isValid = isValidResistance(value);
    } else {
      // Use isValidVoltage for Vg, Vcc, Vs
      isValid = isValidVoltage(value);
    }

    // Only update state if potentially valid or empty (allows deletion)
    // You might adjust this based on how strict you want input filtering vs. validation on calculate
    if (value === '' || isValid) {
        onInputChange(name, value);

        // Check for warnings on the potentially valid value
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
    // Calculation will trigger via useEffect dependency change
  };

  const handleCustomParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Basic validation (optional, as above)
     let isValid = true;
    if (name === 'rds_on') {
      // isValid = isValidResistance(value);
    } else if (name === 'vth') {
      isValid = isValidVoltage(value);
    }

    if (value === '' || isValid) {
        onDetailsChange('custom', {...mosfetDetails, [name]: value});
        const warning = getParameterWarning(name, value);
        setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
    // Calculation will trigger via useEffect dependency change
  };

  // --- Calculation Logic Moved to useEffect ---
  useEffect(() => {
    console.log("useEffect triggered for calculation");
    // Gather necessary values from state/props
    const { vth: vthStr, rds_on: rdsOnStr } = mosfetDetails;
    const { vg: vgStr, vcc: vccStr, vs: vsStr, loadResistance: loadResistanceStr } = inputValues;

    // 1. Check if all *required* string inputs have values
    //    (Vs might default if empty, check calculateNChannelConduction requirements)
    if (!vthStr || !rdsOnStr || !vgStr || !vccStr || !loadResistanceStr) {
      console.log("Required fields missing, updating description.");
      updateDescription('Please fill in all required fields.', null, '', '', '', '', '', '');
      return; // Exit early
    }

    // 2. Attempt to parse all values
    const vth = parseFloat(vthStr);
    const rds_on = parseValueWithSuffix(rdsOnStr); // Use robust parser
    const vg = parseFloat(vgStr);
    const vs = parseFloat(vsStr || '0'); // Default Vs to 0 if empty string
    const vcc = parseFloat(vccStr);
    const loadResistance = parseValueWithSuffix(loadResistanceStr); // Use robust parser

    // 3. Check if parsing resulted in valid numbers
    //    (parseValueWithSuffix returns 0 for invalid, so check isNaN and >0 for resistance)
    if (isNaN(vth) || isNaN(rds_on) || isNaN(vg) || isNaN(vs) || isNaN(vcc) || isNaN(loadResistance) || loadResistance <= 0) {
       console.log("Invalid numeric input detected after parsing:", { vth, rds_on, vg, vs, vcc, loadResistance });
       // Update description based on which value is invalid, or a generic message
       let errorMsg = 'Invalid numeric value detected in inputs.';
       if (isNaN(loadResistance) || loadResistance <= 0) {
           errorMsg = 'Invalid or non-positive Load Resistance value.';
       } // Add more specific checks if desired
       updateDescription(errorMsg, null, '', '', '', '', '', '');
       return; // Exit early
    }

    // 4. All checks passed, perform the calculation
    console.log("Calculating with values:", { vth, vg, vs, vcc, loadResistance, rds_on });
    const result = calculateNChannelConduction(vth, vg, vs, vcc, loadResistance, rds_on);

    // 5. Update the description with results
    console.log("Calculation result:", result);
    updateDescription(
      result.description,
      result.conducting,
      result.voltageAcrossLoad,
      result.powerDissipated,
      result.currentThroughLoad,
      result.vgs,
      result.id,
      result.vd
    );

  }, [
      mosfetDetails.vth, // Dependency: Vth string
      mosfetDetails.rds_on, // Dependency: Rds_on string
      inputValues.vg, // Dependency: Vg string
      inputValues.vcc, // Dependency: Vcc string
      inputValues.vs, // Dependency: Vs string (even if defaults)
      inputValues.loadResistance, // Dependency: Load Resistance string
      updateDescription, // Dependency: Callback function
      inputValues, // Add entire inputValues object
      mosfetDetails // Add entire mosfetDetails object
  ]); // Add updateDescription to dependency array


  // Effect to clear description when MOSFET name changes (as before)
  useEffect(() => {
    // This should probably clear only the results part of the description
    // or maybe be handled within the main calculation useEffect?
    // For now, keeping it separate as it was.
    console.log("MOSFET name changed, clearing description.");
    updateDescription('', null, '', '', '', '', '', '');
  }, [mosfetName, updateDescription]); // Add updateDescription

  // --- JSX Rendering (Simplified Tooltip Usage) ---
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">N-Channel Configuration</h3>

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
            {Object.keys(nChannelMosfets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {mosfetName === 'custom' ? (
          <>
            {/* Vth Input */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                name="vth"
                className="mosfet-input"
                value={mosfetDetails.vth}
                onChange={handleCustomParamChange}
                placeholder="Enter threshold voltage"
                title={getParameterTooltip('vth')} // Standard HTML title attribute
              />
              {warnings.vth && <div className="text-yellow-400 text-sm mt-1">{warnings.vth}</div>}
            </div>

            {/* Rds_on Input */}
             <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <input
                type="text"
                name="rds_on"
                className="mosfet-input"
                value={mosfetDetails.rds_on}
                onChange={handleCustomParamChange}
                placeholder="Enter on resistance (e.g., 22m)"
                title={getParameterTooltip('rds_on')}
              />
               <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.rds_on && <div className="text-yellow-400 text-sm mt-1">{warnings.rds_on}</div>}
            </div>

            {/* Vg, Vcc, Vs, LoadResistance Inputs (similar structure) */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <input
                type="text"
                name="vg"
                className="mosfet-input"
                value={inputValues.vg}
                onChange={handleInputChange}
                placeholder="Enter gate voltage"
                 title={getParameterTooltip('vg')}
              />
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

             <div>
              <label className="mosfet-label">Supply Voltage (Vcc)</label>
              <input
                type="text"
                name="vcc"
                className="mosfet-input"
                value={inputValues.vcc}
                onChange={handleInputChange}
                placeholder="Enter supply voltage"
                title={getParameterTooltip('vcc')}
              />
              {warnings.vcc && <div className="text-yellow-400 text-sm mt-1">{warnings.vcc}</div>}
            </div>

             <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <input
                type="text"
                name="vs"
                className="mosfet-input"
                value={inputValues.vs}
                onChange={handleInputChange}
                placeholder="Usually 0V (ground)"
                title={getParameterTooltip('vs')}
              />
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

             <div>
              <label className="mosfet-label">Load Resistance</label>
              <input
                type="text"
                name="loadResistance"
                className="mosfet-input"
                value={inputValues.loadResistance}
                onChange={handleInputChange}
                placeholder="Enter load resistance"
                title={getParameterTooltip('loadResistance')}
              />
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        ) : mosfetName && (
          <>
            {/* Read-only Vth */}
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                value={formatValueWithSuffix(parseFloat(mosfetDetails.vth || 'NaN'), 'V')} // Format value
                readOnly
                title={getParameterTooltip('vth')}
              />
            </div>

            {/* Read-only Rds_on */}
            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <input
                type="text"
                className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                // Ensure rds_on string is parsed correctly before formatting
                value={formatValueWithSuffix(parseValueWithSuffix(mosfetDetails.rds_on || '0'), 'Ω')} // Format value
                readOnly
                title={getParameterTooltip('rds_on')}
              />
            </div>

            {/* Editable Vg, Vcc, Vs, LoadResistance (same as above) */}
             <div>
              <label className="mosfet-label">Gate Voltage (Vg)</label>
              <input
                type="text"
                name="vg"
                className="mosfet-input"
                value={inputValues.vg}
                onChange={handleInputChange}
                placeholder="Enter gate voltage"
                 title={getParameterTooltip('vg')}
              />
              {warnings.vg && <div className="text-yellow-400 text-sm mt-1">{warnings.vg}</div>}
            </div>

             <div>
              <label className="mosfet-label">Supply Voltage (Vcc)</label>
              <input
                type="text"
                name="vcc"
                className="mosfet-input"
                value={inputValues.vcc}
                onChange={handleInputChange}
                placeholder="Enter supply voltage"
                title={getParameterTooltip('vcc')}
              />
              {warnings.vcc && <div className="text-yellow-400 text-sm mt-1">{warnings.vcc}</div>}
            </div>

             <div>
              <label className="mosfet-label">Source Voltage (Vs)</label>
              <input
                type="text"
                name="vs"
                className="mosfet-input"
                value={inputValues.vs}
                onChange={handleInputChange}
                placeholder="Usually 0V (ground)"
                title={getParameterTooltip('vs')}
              />
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>

             <div>
              <label className="mosfet-label">Load Resistance</label>
              <input
                type="text"
                name="loadResistance"
                className="mosfet-input"
                value={inputValues.loadResistance}
                onChange={handleInputChange}
                placeholder="Enter load resistance"
                title={getParameterTooltip('loadResistance')}
              />
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}