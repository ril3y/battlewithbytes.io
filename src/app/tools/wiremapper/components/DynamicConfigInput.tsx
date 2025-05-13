import React from 'react';
import { Switch } from '@headlessui/react';
import { ConfigOption, ConfigOptionNumber, ConfigOptionBoolean, ConfigOptionSelect, ConfigOptionRadio, ConfigOptionText, Connector } from '../types';

interface DynamicConfigInputProps {
  option: ConfigOption;
  value: any; // The current value of the state corresponding to option.key
  onChange: (key: string, value: any) => void;
  disabled?: boolean; // Optional disabled state
}

export const DynamicConfigInput: React.FC<DynamicConfigInputProps> = ({ option, value, onChange, disabled = false }) => {
  const commonClasses = `w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  switch (option.type) {
    case 'number': {
      const numOption = option as ConfigOptionNumber;
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{numOption.label}</label>
          <input
            type="number"
            min={numOption.min}
            max={numOption.max}
            step={numOption.step ?? 1}
            value={value ?? numOption.defaultValue ?? ''}
            onChange={(e) => onChange(numOption.key, parseInt(e.target.value, 10) || numOption.defaultValue || 0)}
            disabled={disabled}
            className={commonClasses}
          />
        </div>
      );
    }
    case 'boolean': {
      const boolOption = option as ConfigOptionBoolean;
      // Using a simple checkbox for now, can switch back to Headless UI Switch if preferred
       return (
         <label className="inline-flex items-center">
           <input
             type="checkbox"
             checked={value ?? boolOption.defaultValue ?? false}
             onChange={(e) => onChange(boolOption.key, e.target.checked)}
             disabled={disabled}
             className={`rounded text-green-500 focus:ring-green-400 bg-gray-700 border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
           />
           <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{boolOption.label}</span>
         </label>
       );
       /* // Headless UI Switch implementation:
       return (
           <div className="flex items-center">
              <Switch
                checked={value ?? boolOption.defaultValue ?? false}
                onChange={(checked) => onChange(boolOption.key, checked)}
                disabled={disabled}
                className={`${value ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{boolOption.label}</span>
           </div>
       );
       */
    }
    case 'radio': {
      const radioOption = option as ConfigOptionRadio;
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-1">{radioOption.label}</label>
          <div className="flex space-x-4">
            {radioOption.options.map((opt) => (
              <label key={String(opt.value)} className="inline-flex items-center">
                <input
                  type="radio"
                  name={radioOption.key} // Group radios by the key
                  value={String(opt.value)}
                  checked={value === opt.value}
                  onChange={(e) => onChange(radioOption.key, opt.value)} // Pass the actual value type
                  disabled={disabled}
                  className={`text-green-500 focus:ring-green-400 bg-gray-700 border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    case 'select': {
        const selectOption = option as ConfigOptionSelect;
        return (
            <div>
                <label className="block text-sm text-gray-400 mb-1">{selectOption.label}</label>
                <select
                    value={value ?? selectOption.defaultValue ?? ''}
                    onChange={(e) => onChange(selectOption.key, e.target.value)} // Adjust type if needed
                    disabled={disabled}
                    className={commonClasses}
                >
                    {selectOption.options.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
    case 'text': {
      const textOption = option as ConfigOptionText;
      return (
        <div>
          <label htmlFor={textOption.key} className="block text-sm font-medium text-gray-400 mb-1">
            {textOption.label}
          </label>
          <input
            type="text"
            id={textOption.key}
            name={textOption.key}
            value={value || ''}
            onChange={(e) => onChange(textOption.key, e.target.value)}
            placeholder={textOption.placeholder || ''}
            disabled={disabled || textOption.disabledCondition?.(value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {textOption.description && <p className="mt-1 text-xs text-gray-500">{textOption.description}</p>}
        </div>
      );
    }
    default:
      // Ensure exhaustive check (useful with TypeScript)
      const exhaustiveCheck: never = option;
      console.warn('Unhandled config option type:', exhaustiveCheck);
      return null;
  }
};

// Optional: Export component from an index file in the components directory
// e.g., in src/app/tools/wiremapper/components/index.ts
// export * from './DynamicConfigInput';
