import React from 'react';
import type { ConfigField } from '../../lib/component-library';
import { ArrayConfigField } from './ArrayConfigField';

export type ConfigPrimitiveValue = string | number | boolean;
export type ConfigFieldValue = ConfigPrimitiveValue | ConfigPrimitiveValue[];

interface ConfigFormFieldProps {
  fieldName: string;
  fieldSchema: ConfigField;
  value: ConfigFieldValue;
  onChange: (value: ConfigFieldValue) => void;
  syncValue?: number;
}

/**
 * ConfigFormField Component
 *
 * Renders an input element matching the ConfigField type:
 * number, color, select, string, boolean, or array (delegated to ArrayConfigField).
 */
export const ConfigFormField: React.FC<ConfigFormFieldProps> = ({
  fieldName,
  fieldSchema,
  value,
  onChange,
  syncValue,
}) => {
  const renderInput = () => {
    switch (fieldSchema.type) {
      case 'array':
        return (
          <ArrayConfigField
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            value={Array.isArray(value) ? value as ConfigPrimitiveValue[] : []}
            onChange={onChange as (v: ConfigPrimitiveValue[]) => void}
            syncValue={syncValue}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={String(value ?? fieldSchema.default)}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={fieldSchema.min}
            max={fieldSchema.max}
            step={fieldSchema.step || 1}
            style={inputStyle}
          />
        );

      case 'color':
        return (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              value={String(value ?? fieldSchema.default)}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '60px',
                height: '36px',
                border: '1px solid #333',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={String(value ?? fieldSchema.default)}
              onChange={(e) => onChange(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        );

      case 'select': {
        // Preserve numeric option types so generators can do arithmetic on
        // selected values (e.g. scale=1.5). HTMLSelectElement.value is always
        // a string, so we coerce based on the schema's option types.
        const optionsAreNumeric = fieldSchema.options?.length
          ? fieldSchema.options.every((o) => typeof o.value === 'number')
          : false;
        return (
          <select
            value={String(value ?? fieldSchema.default)}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(optionsAreNumeric ? Number(raw) : raw);
            }}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {fieldSchema.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      case 'boolean':
        return (
          <select
            value={String(value ?? fieldSchema.default)}
            onChange={(e) => onChange(e.target.value === 'true')}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'string':
      default:
        return (
          <input
            type="text"
            value={String(value ?? fieldSchema.default ?? '')}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        );
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          color: '#00ffa0',
          fontSize: '13px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        {fieldSchema.label}
      </label>
      {renderInput()}
      {fieldSchema.description && (
        <div
          style={{
            marginTop: '6px',
            color: '#888',
            fontSize: '11px',
            lineHeight: '1.4',
          }}
        >
          {fieldSchema.description}
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'monospace',
};
