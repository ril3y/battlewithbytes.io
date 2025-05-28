import React from 'react';
import { 
  ConfigOption, 
  ConfigOptionText,
  ConfigOptionNumber,
  ConfigOptionBoolean,
  ConfigOptionSelect,
  ConfigOptionRadio,
  ConnectorConfig
} from '../types';

type ConfigValue = string | number | boolean | undefined;

type DisabledConditionFn<T> = ((state: Partial<ConnectorConfig>) => boolean) | ((value: T) => boolean);

function isValueCondition<T>(fn: DisabledConditionFn<T>): fn is (value: T) => boolean {
  return fn.length === 1;
}

const commonClasses = 'w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400';

type OnChangeHandler = (key: string, value: ConfigValue) => void;

interface DynamicConfigInputProps {
  option: ConfigOption;
  value: ConfigValue;
  onChange: OnChangeHandler;
  disabled?: boolean;
}

export const DynamicConfigInput: React.FC<DynamicConfigInputProps> = ({ option, value, onChange, disabled = false }) => {
  const renderInput = () => {
    switch (option.type) {
      case 'number': {
        const numOption = option as ConfigOptionNumber;
        return (
          <input
            type="number"
            min={numOption.min}
            max={numOption.max}
            step={numOption.step ?? 1}
            value={value as number ?? numOption.defaultValue ?? 0}
            onChange={(e) => onChange(option.key, parseInt(e.target.value, 10) || 0)}
            disabled={disabled}
            className={`${commonClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        );
      }
      case 'boolean': {
        const boolOption = option as ConfigOptionBoolean;
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value ?? boolOption.defaultValue ?? false)}
              onChange={(e) => onChange(option.key, e.target.checked)}
              disabled={disabled}
              className={`rounded text-green-500 focus:ring-green-400 bg-gray-700 border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <span className="ml-2 text-sm text-gray-300">{boolOption.label}</span>
          </div>
        );
      }
      case 'text': {
        const textOption = option as ConfigOptionText;
        const isDisabled = disabled || (
          textOption.disabledCondition
            ? isValueCondition(textOption.disabledCondition as DisabledConditionFn<ConfigValue>)
              ? (textOption.disabledCondition as (value: ConfigValue) => boolean)(value)
              : (textOption.disabledCondition as (state: Partial<ConnectorConfig>) => boolean)({})
            : false
        );
        
        return (
          <input
            type="text"
            value={value as string ?? ''}
            onChange={(e) => onChange(option.key, e.target.value)}
            disabled={isDisabled}
            className={`${commonClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={textOption.placeholder}
          />
        );
      }
      case 'select': {
        const selectOption = option as ConfigOptionSelect;
        return (
          <select
            value={value as string ?? ''}
            onChange={(e) => {
              const selected = selectOption.options.find(opt => String(opt.value) === e.target.value);
              if (selected) {
                onChange(option.key, selected.value);
              }
            }}
            disabled={disabled}
            className={`${commonClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectOption.options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }
      case 'radio': {
        const radioOption = option as ConfigOptionRadio;
        return (
          <div className="space-y-2">
            {radioOption.options.map((opt) => (
              <label key={String(opt.value)} className="flex items-center">
                <input
                  type="radio"
                  name={radioOption.key}
                  value={String(opt.value)}
                  checked={value === opt.value}
                  onChange={() => onChange(radioOption.key, opt.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-green-500 focus:ring-green-400 border-gray-600 bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      }
      default: {
        // Ensure exhaustive check (useful with TypeScript)
        const exhaustiveCheck: never = option;
        console.warn('Unhandled config option type:', (exhaustiveCheck as ConfigOption).type);
        return null;
      }
    }
  };

  const renderLabel = () => {
    if (option.type === 'boolean') return null;
    return (
      <label className="block text-sm text-gray-400 mb-1">
        {option.label}
      </label>
    );
  };

  return (
    <div className="mb-4">
      {renderLabel()}
      {renderInput()}
      {option.description && (
        <p className="mt-1 text-xs text-gray-500">{option.description}</p>
      )}
    </div>
  );
};

// Optional: Export component from an index file in the components directory
// e.g., in src/components/tools/WireMapper/components/index.ts
// export * from './DynamicConfigInput';
