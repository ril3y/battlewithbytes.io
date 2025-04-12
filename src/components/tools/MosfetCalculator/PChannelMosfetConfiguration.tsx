'use client';

import React, { useEffect, useState } from 'react';
import mosfetData from './mosfetData.json';
import { calculatePChannelConduction } from './mosfetUtils';
import { 
  parseResistance, 
  isValidResistance, 
  isValidVoltage, 
  formatResistance,
  getParameterWarning,
  getParameterTooltip
} from './inputUtils';

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
    vcc: string;
    vd: string;
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
    vd: string
  ) => void;
}

export default function PChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange,
  updateDescription
}: PChannelMosfetConfigurationProps) {
  const pChannelMosfets = mosfetData.mosfets['p-channel'] as PChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
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
    
    // Auto-calculate when MOSFET is selected
    setTimeout(() => calculateConduction(), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate input based on field type
    if (name === 'loadResistance') {
      if (!isValidResistance(value)) return;
    } else {
      // For voltage inputs
      if (!isValidVoltage(value)) return;
    }
    
    onInputChange(name, value);

    // Check for warnings
    const warning = getParameterWarning(name, value);
    setWarnings(prev => ({
      ...prev,
      [name]: warning
    }));
    
    // Auto-calculate when input changes
    setTimeout(() => calculateConduction(), 0);
  };

  const handleCustomParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate input
    if (name === 'rds_on') {
      if (!isValidResistance(value)) return;
    } else {
      // For voltage inputs like vth
      if (!isValidVoltage(value)) return;
    }
    
    onDetailsChange('custom', {...mosfetDetails, [name]: value});

    // Check for warnings
    const warning = getParameterWarning(name, value);
    setWarnings(prev => ({
      ...prev,
      [name]: warning
    }));
    
    // Auto-calculate when custom parameters change
    setTimeout(() => calculateConduction(), 0);
  };

  const calculateConduction = () => {
    if (!mosfetDetails.vth || !mosfetDetails.rds_on || !inputValues.vg || !inputValues.vcc || !inputValues.loadResistance) {
      updateDescription('Please fill in all required fields.', null, '', '', '', '', '', '');
      return;
    }

    const vth = parseFloat(mosfetDetails.vth);
    const rds_on = parseFloat(mosfetDetails.rds_on);
    const vg = parseFloat(inputValues.vg);
    const vs = parseFloat(inputValues.vs || '0');
    const vcc = parseFloat(inputValues.vcc);
    const loadResistance = parseResistance(inputValues.loadResistance);

    const result = calculatePChannelConduction(vth, vg, vs, vcc, loadResistance, rds_on);

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
  };

  // Only reset description when MOSFET type or model changes, not on every input change
  useEffect(() => {
    // Reset description when MOSFET selection changes
    updateDescription('', null, '', '', '', '', '', '');
  }, [mosfetName, updateDescription]);

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
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                name="vth"
                className="mosfet-input"
                value={mosfetDetails.vth}
                onChange={handleCustomParamChange}
                placeholder="Enter negative threshold voltage"
                title={getParameterTooltip('vth')}
              />
              <small className="text-gray-400 block mt-1">For P-Channel MOSFETs, Vth should be negative (e.g., -2)</small>
              {warnings.vth && <div className="text-yellow-400 text-sm mt-1">{warnings.vth}</div>}
            </div>
            
            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <input
                type="text"
                name="rds_on"
                className="mosfet-input"
                value={mosfetDetails.rds_on}
                onChange={handleCustomParamChange}
                placeholder="Enter on resistance"
                title={getParameterTooltip('rds_on')}
              />
              {warnings.rds_on && <div className="text-yellow-400 text-sm mt-1">{warnings.rds_on}</div>}
            </div>
            
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
                placeholder="Usually same as Vcc for P-channel"
                title={getParameterTooltip('vs')}
              />
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>
            
            <div>
              <label className="mosfet-label">Load Resistance (Ω)</label>
              <input
                type="text"
                name="loadResistance"
                className="mosfet-input"
                value={inputValues.loadResistance}
                onChange={handleInputChange}
                placeholder="Enter load resistance (e.g., 10k, 1M)"
                title={getParameterTooltip('loadResistance')}
              />
              <small className="text-gray-400 block mt-1">You can use k (kilo), M (mega), m (milli), u (micro)</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        ) : mosfetName && (
          <>
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                className="mosfet-input"
                value={mosfetDetails.vth}
                readOnly
                title={getParameterTooltip('vth')}
              />
            </div>
            
            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <input
                type="text"
                className="mosfet-input"
                value={mosfetDetails.rds_on}
                readOnly
                title={getParameterTooltip('rds_on')}
              />
            </div>
            
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
                placeholder="Usually same as Vcc for P-channel"
                title={getParameterTooltip('vs')}
              />
              {warnings.vs && <div className="text-yellow-400 text-sm mt-1">{warnings.vs}</div>}
            </div>
            
            <div>
              <label className="mosfet-label">Load Resistance (Ω)</label>
              <input
                type="text"
                name="loadResistance"
                className="mosfet-input"
                value={inputValues.loadResistance}
                onChange={handleInputChange}
                placeholder="Enter load resistance (e.g., 10k, 1M)"
                title={getParameterTooltip('loadResistance')}
              />
              <small className="text-gray-400 block mt-1">You can use k (kilo), M (mega), m (milli), u (micro)</small>
              {warnings.loadResistance && <div className="text-yellow-400 text-sm mt-1">{warnings.loadResistance}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
