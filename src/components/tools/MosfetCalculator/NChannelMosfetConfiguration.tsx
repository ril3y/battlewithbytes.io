'use client';

import React, { useState } from 'react';
import {
  parseValueWithSuffix,
  formatValueWithSuffix,
  isValidVoltage,
  getParameterWarning, 
  getParameterTooltip  
} from '../../../lib/utils/inputUtils';
import mosfetData from './mosfetData.json';

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
    vs: string;
    loadResistance: string;
  };
  onDetailsChange: (name: string, details: { vth: string; rds_on: string }) => void;
  onInputChange: (name: string, value: string) => void;
}

export default function NChannelMosfetConfiguration({
  mosfetName,
  mosfetDetails,
  inputValues,
  onDetailsChange,
  onInputChange
}: NChannelMosfetConfigurationProps) {
  const nChannelMosfets = mosfetData.mosfets['n-channel'] as NChannelMosfets;
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});

  const handleMosfetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setWarnings({});
    if (selectedName === '') {
      onDetailsChange('', { vth: '', rds_on: '' });
      return;
    }

    if (selectedName === 'custom') {
      onDetailsChange(selectedName, { vth: '', rds_on: '' });
      return;
    }

    const selectedMosfet = nChannelMosfets[selectedName];
    onDetailsChange(selectedName, {
      vth: selectedMosfet.vth.toString(),
      rds_on: selectedMosfet.rds_on.toString()
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let isValid = true;
    if (name === 'loadResistance') {
    } else {
      isValid = isValidVoltage(value);
    }

    if (value === '' || isValid) {
      onInputChange(name, value);

      const warning = getParameterWarning(name, value);
      setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
  };

  const handleCustomParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let isValid = true;
    if (name === 'rds_on') {
    } else if (name === 'vth') {
      isValid = isValidVoltage(value);
    }

    if (value === '' || isValid) {
      onDetailsChange('custom', {...mosfetDetails, [name]: value});
      const warning = getParameterWarning(name, value);
      setWarnings(prev => ({ ...prev, [name]: warning || '' }));
    }
  };

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
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                name="vth"
                className="mosfet-input"
                value={mosfetDetails.vth}
                onChange={handleCustomParamChange}
                placeholder="Enter threshold voltage"
                title={getParameterTooltip('vth')}
              />
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
                placeholder="Enter on resistance (e.g., 22m)"
                title={getParameterTooltip('rds_on')}
              />
              <small className="text-gray-400 block mt-1">Use k, M, m, u/µ</small>
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
            <div className="mt-4">
              <label className="mosfet-label">Threshold Voltage (Vth)</label>
              <input
                type="text"
                className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                value={formatValueWithSuffix(parseFloat(mosfetDetails.vth || 'NaN'), 'V')} 
                readOnly
                title={getParameterTooltip('vth')}
              />
            </div>

            <div>
              <label className="mosfet-label">On Resistance (Rds_on)</label>
              <input
                type="text"
                className="mosfet-input bg-opacity-50 bg-gray-800 cursor-not-allowed"
                value={formatValueWithSuffix(parseValueWithSuffix(mosfetDetails.rds_on || '0'), 'Ω')} 
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