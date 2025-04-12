'use client';

import React, { useState } from 'react';
import Tooltip from '../../../lib/utils/Tooltip';
import { 
  isValidNumberInput, 
  parseValueWithSuffix, 
  getParameterWarning,
  getParameterTooltip
} from '../../../lib/utils/inputUtils';
import { OhmsLawValues } from './index';

interface OhmsLawFormProps {
  values: OhmsLawValues;
  onValueChange: (name: string, value: string) => void;
  onCalculate: (calculationMode: 'voltage' | 'current' | 'resistance' | 'power') => void;
  onClear: () => void;
}

// Warning ranges for each parameter
const warningRanges = {
  voltage: {
    min: 0,
    max: 1000,
    warningMessage: "Unusual voltage value"
  },
  current: {
    min: 0.000001, // 1µA
    max: 100,      // 100A
    warningMessage: "Unusual current value"
  },
  resistance: {
    min: 0.1,      // 0.1Ω
    max: 10000000, // 10MΩ
    warningMessage: "Unusual resistance value"
  },
  power: {
    min: 0.000001, // 1µW
    max: 10000,    // 10kW
    warningMessage: "Unusual power value"
  }
};

const OhmsLawForm: React.FC<OhmsLawFormProps> = ({ 
  values, 
  onValueChange, 
  onCalculate,
  onClear
}) => {
  const [warnings, setWarnings] = useState<{[key: string]: string}>({});
  const [calculationMode, setCalculationMode] = useState<'voltage' | 'current' | 'resistance' | 'power'>('voltage');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate input
    if (!isValidNumberInput(value) && value !== '') {
      return;
    }
    
    onValueChange(name, value);
    
    // Check for warnings
    if (value) {
      const parsedValue = parseValueWithSuffix(value);
      const warning = getParameterWarning(name, parsedValue, warningRanges);
      setWarnings((prev: {[key: string]: string}) => ({
        ...prev,
        [name]: warning
      }));
    } else {
      // Clear warning if field is empty
      setWarnings((prev: {[key: string]: string}) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCalculationMode((prev: 'voltage' | 'current' | 'resistance' | 'power') => e.target.value as 'voltage' | 'current' | 'resistance' | 'power');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(calculationMode);
  };

  const getTooltip = (name: string) => {
    return getParameterTooltip(name);
  };

  return (
    <form onSubmit={handleSubmit} className="ohms-law-form">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Calculate</label>
        <select 
          className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
          value={calculationMode}
          onChange={handleModeChange}
        >
          <option value="voltage">Voltage (V)</option>
          <option value="current">Current (I)</option>
          <option value="resistance">Resistance (R)</option>
          <option value="power">Power (P)</option>
        </select>
      </div>

      <div className="space-y-4">
        {calculationMode !== 'voltage' && (
          <div>
            <label className="block text-sm font-medium mb-2">Voltage (V)</label>
            <Tooltip text={getTooltip('voltage')} position="top">
              <input
                type="text"
                name="voltage"
                className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                value={values.voltage}
                onChange={handleInputChange}
                placeholder="Enter voltage (e.g., 5V)"
              />
            </Tooltip>
            {warnings.voltage && <div className="text-yellow-400 text-sm mt-1">{warnings.voltage}</div>}
          </div>
        )}

        {calculationMode !== 'current' && (
          <div>
            <label className="block text-sm font-medium mb-2">Current (I)</label>
            <Tooltip text={getTooltip('current')} position="top">
              <input
                type="text"
                name="current"
                className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                value={values.current}
                onChange={handleInputChange}
                placeholder="Enter current (e.g., 500mA)"
              />
            </Tooltip>
            {warnings.current && <div className="text-yellow-400 text-sm mt-1">{warnings.current}</div>}
          </div>
        )}

        {calculationMode !== 'resistance' && (
          <div>
            <label className="block text-sm font-medium mb-2">Resistance (R)</label>
            <Tooltip text={getTooltip('resistance')} position="top">
              <input
                type="text"
                name="resistance"
                className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                value={values.resistance}
                onChange={handleInputChange}
                placeholder="Enter resistance (e.g., 1kΩ)"
              />
            </Tooltip>
            {warnings.resistance && <div className="text-yellow-400 text-sm mt-1">{warnings.resistance}</div>}
          </div>
        )}

        {calculationMode !== 'power' && (
          <div>
            <label className="block text-sm font-medium mb-2">Power (P)</label>
            <Tooltip text={getTooltip('power')} position="top">
              <input
                type="text"
                name="power"
                className="w-full bg-black/30 border border-gray-700 rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                value={values.power}
                onChange={handleInputChange}
                placeholder="Enter power (e.g., 5W)"
              />
            </Tooltip>
            {warnings.power && <div className="text-yellow-400 text-sm mt-1">{warnings.power}</div>}
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-transparent border border-[#00ff9d] text-[#00ff9d] py-2 px-4 rounded-md hover:bg-[#00ff9d] hover:text-black transition-colors font-mono"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 bg-transparent border border-gray-600 text-gray-400 py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-mono"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default OhmsLawForm;
