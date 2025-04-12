'use client';

import React, { useState } from 'react';
import Tooltip from '../../../lib/utils/Tooltip';
import { 
  isValidNumberInput, 
  parseValueWithSuffix, 
  getParameterWarning,
  getParameterTooltip,
  validateFieldInput,
  parseFieldValue,
  FieldType
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
    warningMessage: 'Warning: Voltage is outside typical range for small electronics (0-1000V).'
  },
  current: {
    min: 0.0001,
    max: 100,
    warningMessage: 'Warning: Current is outside typical range for small electronics (0.1mA-100A).'
  },
  resistance: {
    min: 0.01,
    max: 10000000,
    warningMessage: 'Warning: Resistance is outside typical range (0.01Ω-10MΩ).'
  },
  power: {
    min: 0.001,
    max: 10000,
    warningMessage: 'Warning: Power is outside typical range for small electronics (1mW-10kW).'
  }
};

const OhmsLawForm: React.FC<OhmsLawFormProps> = ({ 
  values, 
  onValueChange, 
  onCalculate,
  onClear
}) => {
  const [calculationMode, setCalculationMode] = useState<'voltage' | 'current' | 'resistance' | 'power'>('voltage');
  const [warnings, setWarnings] = useState<{[key: string]: string}>({
    voltage: '',
    current: '',
    resistance: '',
    power: ''
  });
  
  // Count how many fields have values
  const filledFieldsCount = Object.values(values).filter(value => value.trim() !== '').length;
  
  // Determine which fields have values (excluding the calculation mode)
  const filledFields = Object.entries(values)
    .filter(([key, value]) => key !== calculationMode && value.trim() !== '')
    .map(([key]) => key);
  
  // Determine if a field should be disabled
  const shouldDisableField = (fieldName: string) => {
    // Never disable the field that's being calculated
    if (fieldName === calculationMode) return false;
    
    // If we already have 2 fields filled (excluding the calculation mode)
    // and this field is not one of them, disable it
    return filledFieldsCount >= 2 && !filledFields.includes(fieldName);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only update if the input is valid or empty
    if (value === '' || isValidNumberInput(value)) {
      onValueChange(name, value);
      
      // Check for warnings only if the field has a value
      if (value.trim() !== '') {
        const { isValid, parsedValue } = validateFieldInput(value, name as FieldType);
        if (isValid) {
          const warning = getParameterWarning(name as string, parsedValue);
          setWarnings(prev => ({
            ...prev,
            [name]: warning
          }));
        }
      } else {
        // Clear warning if field is empty
        setWarnings(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  // Format display value for current to show mA when appropriate
  const formatCurrentDisplay = (value: string): string => {
    if (!value) return '';
    
    // Check if the value is already in mA format
    if (value.toLowerCase().includes('ma') || 
        (value.toLowerCase().includes('m') && !value.toLowerCase().includes('ma'))) {
      return value; // Keep as is
    }
    
    // If it's a numeric value less than 0.1, convert to mA
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue < 0.1 && numericValue > 0) {
      return `${(numericValue * 1000).toFixed(2)}mA`;
    }
    
    return value;
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

  // Get tooltip for disabled fields
  const getDisabledTooltip = (fieldName: string) => {
    if (shouldDisableField(fieldName)) {
      return "You can only enter 2 values. Clear one of the existing values to edit this field.";
    }
    return getTooltip(fieldName);
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
      
      <div className="bg-black/40 border border-gray-800 rounded-md p-4 mb-6">
        <p className="text-sm text-[#00ff9d] font-mono mb-2">INSTRUCTIONS</p>
        <p className="text-sm text-gray-300">
          Enter values for <strong>exactly 2 parameters</strong> to calculate the remaining values.
        </p>
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <p>• Input values with these units:</p>
          <ul className="ml-4 list-disc">
            <li>Current: <span className="text-yellow-400">5 means 5A</span>, <span className="text-yellow-400">5m or 5mA means 5 milliamps</span></li>
            <li>Power: <span className="text-yellow-400">5 means 5W</span>, <span className="text-yellow-400">5mW means 5 milliwatts</span></li>
            <li>Voltage: <span className="text-yellow-400">5 means 5V</span></li>
            <li>Resistance: <span className="text-yellow-400">5 means 5Ω</span>, <span className="text-yellow-400">5k means 5kΩ</span></li>
          </ul>
          <p>You can also use engineering notation (k, M, m, u) with any value.</p>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {filledFieldsCount < 2 ? (
            `Enter ${2 - filledFieldsCount} more value(s) to calculate.`
          ) : filledFieldsCount > 2 ? (
            "Warning: You've entered more than 2 values. Only 2 are needed for calculation."
          ) : (
            "Ready to calculate!"
          )}
        </p>
      </div>

      <div className="space-y-4">
        {calculationMode !== 'voltage' && (
          <div>
            <label className="block text-sm font-medium mb-2">Voltage (V)</label>
            <Tooltip text={getDisabledTooltip('voltage')} position="top">
              <input
                type="text"
                name="voltage"
                className={`w-full bg-black/30 border ${shouldDisableField('voltage') ? 'border-red-800 bg-red-900/20 cursor-not-allowed' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.voltage}
                onChange={handleInputChange}
                placeholder="Enter voltage (e.g., 5V)"
                disabled={shouldDisableField('voltage')}
              />
            </Tooltip>
            {warnings.voltage && <div className="text-yellow-400 text-sm mt-1">{warnings.voltage}</div>}
          </div>
        )}

        {calculationMode !== 'current' && (
          <div>
            <label className="block text-sm font-medium mb-2">Current (I)</label>
            <Tooltip text={getDisabledTooltip('current')} position="top">
              <input
                type="text"
                name="current"
                className={`w-full bg-black/30 border ${shouldDisableField('current') ? 'border-red-800 bg-red-900/20 cursor-not-allowed' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.current}
                onChange={handleInputChange}
                placeholder="Enter current (e.g., 5 for 5A, 5m or 5mA for 5mA)"
                disabled={shouldDisableField('current')}
              />
            </Tooltip>
            {warnings.current && <div className="text-yellow-400 text-sm mt-1">{warnings.current}</div>}
          </div>
        )}

        {calculationMode !== 'resistance' && (
          <div>
            <label className="block text-sm font-medium mb-2">Resistance (R)</label>
            <Tooltip text={getDisabledTooltip('resistance')} position="top">
              <input
                type="text"
                name="resistance"
                className={`w-full bg-black/30 border ${shouldDisableField('resistance') ? 'border-red-800 bg-red-900/20 cursor-not-allowed' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.resistance}
                onChange={handleInputChange}
                placeholder="Enter resistance (e.g., 5 for 5Ω, 1k for 1kΩ)"
                disabled={shouldDisableField('resistance')}
              />
            </Tooltip>
            {warnings.resistance && <div className="text-yellow-400 text-sm mt-1">{warnings.resistance}</div>}
          </div>
        )}

        {calculationMode !== 'power' && (
          <div>
            <label className="block text-sm font-medium mb-2">Power (P)</label>
            <Tooltip text={getDisabledTooltip('power')} position="top">
              <input
                type="text"
                name="power"
                className={`w-full bg-black/30 border ${shouldDisableField('power') ? 'border-red-800 bg-red-900/20 cursor-not-allowed' : 'border-gray-700'} rounded-md p-2 text-white font-mono focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                value={values.power}
                onChange={handleInputChange}
                placeholder="Enter power (e.g., 5 for 5W, 5mW for 5mW)"
                disabled={shouldDisableField('power')}
              />
            </Tooltip>
            {warnings.power && <div className="text-yellow-400 text-sm mt-1">{warnings.power}</div>}
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-4 mb-8">
        <button
          type="submit"
          className="flex-1 bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 border border-[#00ff9d]/50 text-[#00ff9d] font-mono py-2 px-4 rounded-md transition-all duration-300"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 text-gray-300 font-mono py-2 px-4 rounded-md transition-all duration-300"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default OhmsLawForm;
